import crypto from "node:crypto";
import { metadata, task } from "@trigger.dev/sdk/v3";
import MsgReader, { type FieldsData } from "@kenjiuno/msgreader";
import { simpleParser, type AddressObject, type Attachment } from "mailparser";
import {
  isEmailInputContentType,
  normalizeInputContentType,
  normalizeToPdf,
  pdfPageCount,
} from "../shared/converter/converter";
import { downloadFromBunny } from "../storage/bunny";
import {
  MAX_PDF_BYTES,
  MAX_PDF_PAGES,
  type ExtractionConfig,
  type ExtractionDocument,
  extractFromPdf,
  extractFromPdfs,
  extractTextFromPdf,
  scoreConfidence,
  toFunnelPrefill,
} from "../funnel-extraction/extraction";

export type ExtractDocumentPayload = {
  bunnyPath: string;
  filename: string;
  contentType: string;
};

export type SkippedExtractionPart = {
  parentFilename?: string;
  filename: string;
  contentType?: string;
  size?: number;
  reason: string;
  detail?: string;
};

export type ExtractPayload = {
  funnelSessionId: string;
  documents?: ExtractDocumentPayload[];
  bunnyPath?: string;
  filename?: string;
  contentType?: string;
  extractionConfig: ExtractionConfig;
  options?: {
    selfConsistencySamples?: number;
    runVerifier?: boolean;
  };
};

export type ExtractOutput = {
  extraction: Record<string, unknown>;
  confidences: Record<string, number>;
  funnelPrefill: ReturnType<typeof toFunnelPrefill>["values"];
  funnelConfidences: Record<string, number>;
  documentHash: string;
  documents?: Array<{
    bunnyPath?: string;
    filename: string;
    contentType: string;
    documentHash: string;
    pageCount: number;
    sourceKind?: ExtractionInputSourceKind;
    parentFilename?: string;
    originalFilename?: string;
  }>;
  skippedParts?: SkippedExtractionPart[];
  pageCount: number;
  totalTokens: { input: number; output: number };
  model: string;
};

type ExtractionInputSourceKind =
  | "uploaded-document"
  | "email-body"
  | "email-attachment";

type ExtractionInputDocument = {
  bunnyPath?: string;
  filename: string;
  contentType: string;
  rawBytes: Buffer;
  documentHash: string;
  sourceKind: ExtractionInputSourceKind;
  parentFilename?: string;
  parentBunnyPath?: string;
  originalFilename?: string;
};

type PdfExtractionInputDocument = ExtractionInputDocument & {
  pdf: Buffer;
  pageCount: number;
};

type ParsedEmailAttachment = {
  filename?: string;
  contentType?: string;
  bytes: Buffer;
  size: number;
  related?: boolean;
};

type ParsedEmail = {
  subject?: string;
  from?: string;
  to?: string;
  cc?: string;
  date?: string;
  bodyText: string;
  attachments: ParsedEmailAttachment[];
  skippedParts: SkippedExtractionPart[];
};

type EmailAttachmentSummary = {
  originalFilename: string;
  generatedFilename?: string;
  contentType?: string;
  size?: number;
  related?: boolean;
  included: boolean;
  reason?: string;
};

const MAX_EMAIL_ATTACHMENT_BYTES = 100 * 1024 * 1024;
const MAX_EMAIL_BODY_CHARS = 100_000;

export const extractFromDocument = task({
  id: "extract-from-document",
  maxDuration: 300,
  retry: { maxAttempts: 3, factor: 2, minTimeoutInMs: 2_000 },
  run: async (payload: ExtractPayload): Promise<ExtractOutput> => {
    metadata.set("status", "starting");
    metadata.set("step", "download");

    const payloadDocuments = normalizePayloadDocuments(payload);
    const downloadedDocuments = await Promise.all(
      payloadDocuments.map(async (document) => {
        const { bytes: rawBytes, contentType: serverContentType } =
          await downloadFromBunny(document.bunnyPath);
        const contentType =
          normalizeInputContentType(serverContentType, document.filename) ??
          normalizeInputContentType(document.contentType, document.filename) ??
          document.contentType;
        const documentHash = crypto
          .createHash("sha256")
          .update(rawBytes)
          .digest("hex");

        return {
          ...document,
          rawBytes,
          contentType,
          documentHash,
          sourceKind: "uploaded-document" as const,
        };
      }),
    );

    metadata.set(
      "uploadedDocumentHashes",
      downloadedDocuments.map((document) => ({
        filename: document.filename,
        hash: document.documentHash,
      })) as any,
    );
    metadata.set(
      "uploadedContentTypes",
      downloadedDocuments.map((document) => ({
        filename: document.filename,
        contentType: document.contentType,
      })) as any,
    );
    metadata.set("step", "expand_email");

    const expanded = await expandEmailContainers(downloadedDocuments);
    metadata.set(
      "documentHashes",
      expanded.documents.map((document) => ({
        filename: document.filename,
        hash: document.documentHash,
        sourceKind: document.sourceKind,
        parentFilename: document.parentFilename,
      })) as any,
    );
    metadata.set(
      "contentTypes",
      expanded.documents.map((document) => ({
        filename: document.filename,
        contentType: document.contentType,
        sourceKind: document.sourceKind,
        parentFilename: document.parentFilename,
      })) as any,
    );
    metadata.set("step", "normalize");

    const normalizedPdfs = await normalizeDocumentsToPdfs(expanded.documents);
    const pdfDocuments = normalizedPdfs.documents;
    const skippedParts = [
      ...expanded.skippedParts,
      ...normalizedPdfs.skippedParts,
    ];
    if (skippedParts.length > 0) {
      metadata.set("skippedParts", skippedParts as any);
    }
    if (pdfDocuments.length === 0) {
      throw new Error("No extractable documents remained after normalization.");
    }

    const pageCount = pdfDocuments.reduce(
      (total, document) => total + document.pageCount,
      0,
    );
    if (pageCount > MAX_PDF_PAGES) {
      throw new Error(
        `PDF bundle has ${pageCount} pages; max is ${MAX_PDF_PAGES}.`,
      );
    }

    const documentHash =
      pdfDocuments.length === 1
        ? pdfDocuments[0].documentHash
        : crypto
            .createHash("sha256")
            .update(
              pdfDocuments
                .map((document) => document.documentHash)
                .sort()
                .join("|"),
            )
            .digest("hex");

    metadata.set("documentHash", documentHash);
    metadata.set("pageCount", pageCount);
    metadata.set("step", "extract");

    const extractionDocuments: ExtractionDocument[] = pdfDocuments.map(
      (document) => ({
        pdfBytes: document.pdf,
        filename: document.filename,
      }),
    );
    const primary =
      extractionDocuments.length === 1
        ? await extractFromPdf({
            pdfBytes: extractionDocuments[0].pdfBytes,
            filename: extractionDocuments[0].filename,
            config: payload.extractionConfig,
            onPartialExtraction: (partialExtraction) => {
              metadata.set("partialExtraction", partialExtraction as any);
            },
          })
        : await extractFromPdfs({
            documents: extractionDocuments,
            config: payload.extractionConfig,
            onPartialExtraction: (partialExtraction) => {
              metadata.set("partialExtraction", partialExtraction as any);
            },
          });

    metadata.set("partialExtraction", primary.extraction as any);
    metadata.set("step", "text_index");

    const documentText = (
      await Promise.all(
        pdfDocuments.map((document) => extractTextFromPdf(document.pdf)),
      )
    ).join("\n\n");
    metadata.set("step", "score");

    const confidences = scoreConfidence({
      extraction: primary.extraction,
      documentText,
      config: payload.extractionConfig,
    });

    metadata.set("step", "persist");
    const { values: funnelPrefill, confidences: funnelConfidences } =
      toFunnelPrefill({
        extraction: primary.extraction,
        confidences,
        config: payload.extractionConfig,
        documentName: pdfDocuments
          .map((document) => document.filename)
          .join(", "),
      });

    metadata.set("status", "complete");

    return {
      extraction: primary.extraction,
      confidences,
      funnelPrefill,
      funnelConfidences,
      documentHash,
      documents: pdfDocuments.map((document) => ({
        bunnyPath: document.bunnyPath,
        filename: document.filename,
        contentType: document.contentType,
        documentHash: document.documentHash,
        pageCount: document.pageCount,
        sourceKind: document.sourceKind,
        parentFilename: document.parentFilename,
        originalFilename: document.originalFilename,
      })),
      skippedParts,
      pageCount,
      totalTokens: {
        input: primary.usage.input_tokens,
        output: primary.usage.output_tokens,
      },
      model: primary.model,
    };
  },
});

function normalizePayloadDocuments(
  payload: ExtractPayload,
): ExtractDocumentPayload[] {
  if (payload.documents?.length) {
    return payload.documents;
  }

  if (payload.bunnyPath && payload.filename && payload.contentType) {
    return [
      {
        bunnyPath: payload.bunnyPath,
        filename: payload.filename,
        contentType: payload.contentType,
      },
    ];
  }

  throw new Error("No extraction documents supplied.");
}

async function expandEmailContainers(
  documents: ExtractionInputDocument[],
): Promise<{
  documents: ExtractionInputDocument[];
  skippedParts: SkippedExtractionPart[];
}> {
  const expandedDocuments: ExtractionInputDocument[] = [];
  const skippedParts: SkippedExtractionPart[] = [];

  for (const document of documents) {
    if (!isEmailDocument(document)) {
      expandedDocuments.push(document);
      continue;
    }

    const parsed = await parseEmailDocument(document);
    const expandedEmail = buildEmailExpansionDocuments(document, parsed);
    expandedDocuments.push(...expandedEmail.documents);
    skippedParts.push(...parsed.skippedParts, ...expandedEmail.skippedParts);
  }

  return { documents: expandedDocuments, skippedParts };
}

async function normalizeDocumentsToPdfs(
  documents: ExtractionInputDocument[],
): Promise<{
  documents: PdfExtractionInputDocument[];
  skippedParts: SkippedExtractionPart[];
}> {
  const pdfDocuments: PdfExtractionInputDocument[] = [];
  const skippedParts: SkippedExtractionPart[] = [];

  for (const document of documents) {
    try {
      const { pdf } = await normalizeToPdf({
        bytes: document.rawBytes,
        contentType: document.contentType,
        filename: document.filename,
      });

      if (
        document.sourceKind === "email-attachment" &&
        pdf.byteLength > MAX_PDF_BYTES
      ) {
        skippedParts.push({
          parentFilename: document.parentFilename,
          filename: document.originalFilename ?? document.filename,
          contentType: document.contentType,
          size: pdf.byteLength,
          reason: "pdf_too_large",
          detail: `Converted PDF has ${pdf.byteLength} bytes; max is ${MAX_PDF_BYTES}.`,
        });
        continue;
      }

      const pageCount = await pdfPageCount(pdf);
      pdfDocuments.push({
        ...document,
        pdf,
        pageCount,
      });
    } catch (error) {
      if (document.sourceKind !== "email-attachment") {
        throw error;
      }

      skippedParts.push({
        parentFilename: document.parentFilename,
        filename: document.originalFilename ?? document.filename,
        contentType: document.contentType,
        size: document.rawBytes.byteLength,
        reason: "conversion_failed",
        detail: errorMessage(error),
      });
    }
  }

  return { documents: pdfDocuments, skippedParts };
}

function isEmailDocument(document: {
  contentType: string;
  filename: string;
}): boolean {
  const contentType = normalizeInputContentType(
    document.contentType,
    document.filename,
  );

  return Boolean(contentType && isEmailInputContentType(contentType));
}

async function parseEmailDocument(
  document: ExtractionInputDocument,
): Promise<ParsedEmail> {
  const contentType = normalizeInputContentType(
    document.contentType,
    document.filename,
  );

  try {
    if (contentType === "application/vnd.ms-outlook") {
      return parseMsgEmail(document);
    }

    return parseEmlEmail(document);
  } catch (error) {
    throw new Error(
      `Could not parse email ${document.filename}: ${errorMessage(error)}`,
    );
  }
}

async function parseEmlEmail(
  document: ExtractionInputDocument,
): Promise<ParsedEmail> {
  const parsed = await simpleParser(document.rawBytes);
  const htmlText =
    typeof parsed.html === "string" ? htmlToText(parsed.html) : "";
  const bodyText = normalizeEmailBodyText(parsed.text || htmlText);

  return {
    subject: parsed.subject,
    from: formatMailparserAddress(parsed.from),
    to: formatMailparserAddress(parsed.to),
    cc: formatMailparserAddress(parsed.cc),
    date: parsed.date?.toISOString(),
    bodyText,
    attachments: parsed.attachments.map((attachment, index) =>
      normalizeEmlAttachment(attachment, index),
    ),
    skippedParts: [],
  };
}

function parseMsgEmail(document: ExtractionInputDocument): ParsedEmail {
  const reader = new MsgReader(bufferToArrayBuffer(document.rawBytes));
  const data = reader.getFileData();
  if (data.error) {
    throw new Error(data.error);
  }

  const attachments: ParsedEmailAttachment[] = [];
  const skippedParts: SkippedExtractionPart[] = [];

  (data.attachments ?? []).forEach((attachmentInfo, index) => {
    const fallbackFilename = msgAttachmentFilename(attachmentInfo, index);

    if (attachmentInfo.innerMsgContent) {
      skippedParts.push({
        parentFilename: document.filename,
        filename: fallbackFilename,
        contentType: "application/vnd.ms-outlook",
        size: attachmentInfo.contentLength,
        reason: "nested_email_unsupported",
      });
      return;
    }

    try {
      const attachment = reader.getAttachment(attachmentInfo);
      const bytes = Buffer.from(attachment.content);
      attachments.push({
        filename: attachment.fileName || fallbackFilename,
        contentType: attachmentInfo.attachMimeTag,
        bytes,
        size: bytes.byteLength,
        related: attachmentInfo.attachmentHidden,
      });
    } catch (error) {
      skippedParts.push({
        parentFilename: document.filename,
        filename: fallbackFilename,
        contentType: attachmentInfo.attachMimeTag,
        size: attachmentInfo.contentLength,
        reason: "parse_error",
        detail: errorMessage(error),
      });
    }
  });

  const htmlText =
    data.bodyHtml || data.html
      ? htmlToText(data.bodyHtml ?? decodeBytes(data.html))
      : "";

  return {
    subject: data.subject,
    from: formatMsgSender(data),
    to: formatMsgRecipients(data.recipients, "to"),
    cc: formatMsgRecipients(data.recipients, "cc"),
    date:
      data.clientSubmitTime ?? data.messageDeliveryTime ?? data.creationTime,
    bodyText: normalizeEmailBodyText(data.body || htmlText),
    attachments,
    skippedParts,
  };
}

function buildEmailExpansionDocuments(
  parent: ExtractionInputDocument,
  parsed: ParsedEmail,
): {
  documents: ExtractionInputDocument[];
  skippedParts: SkippedExtractionPart[];
} {
  const attachmentDocuments: ExtractionInputDocument[] = [];
  const skippedParts: SkippedExtractionPart[] = [];
  const attachmentSummaries: EmailAttachmentSummary[] = [];

  parsed.attachments.forEach((attachment, index) => {
    const originalFilename = attachmentFilename(attachment, index);
    const normalizedContentType = normalizeInputContentType(
      attachment.contentType,
      originalFilename,
    );
    const summary: EmailAttachmentSummary = {
      originalFilename,
      contentType: attachment.contentType,
      size: attachment.size,
      related: attachment.related,
      included: false,
    };

    if (attachment.bytes.byteLength === 0) {
      summary.reason = "empty_attachment";
      skippedParts.push({
        parentFilename: parent.filename,
        filename: originalFilename,
        contentType: attachment.contentType,
        size: attachment.size,
        reason: summary.reason,
      });
      attachmentSummaries.push(summary);
      return;
    }

    if (attachment.bytes.byteLength > MAX_EMAIL_ATTACHMENT_BYTES) {
      summary.reason = "attachment_too_large";
      skippedParts.push({
        parentFilename: parent.filename,
        filename: originalFilename,
        contentType: attachment.contentType,
        size: attachment.size,
        reason: summary.reason,
        detail: `Attachment has ${attachment.bytes.byteLength} bytes; max is ${MAX_EMAIL_ATTACHMENT_BYTES}.`,
      });
      attachmentSummaries.push(summary);
      return;
    }

    if (!normalizedContentType) {
      summary.reason = "unsupported_content_type";
      skippedParts.push({
        parentFilename: parent.filename,
        filename: originalFilename,
        contentType: attachment.contentType,
        size: attachment.size,
        reason: summary.reason,
      });
      attachmentSummaries.push(summary);
      return;
    }

    if (isEmailInputContentType(normalizedContentType)) {
      summary.reason = "nested_email_unsupported";
      skippedParts.push({
        parentFilename: parent.filename,
        filename: originalFilename,
        contentType: normalizedContentType,
        size: attachment.size,
        reason: summary.reason,
      });
      attachmentSummaries.push(summary);
      return;
    }

    const generatedFilename = emailAttachmentDocumentFilename(
      parent.filename,
      originalFilename,
      index,
      normalizedContentType,
    );
    summary.generatedFilename = generatedFilename;
    summary.contentType = normalizedContentType;
    summary.included = true;
    attachmentSummaries.push(summary);

    attachmentDocuments.push({
      filename: generatedFilename,
      contentType: normalizedContentType,
      rawBytes: attachment.bytes,
      documentHash: sha256(attachment.bytes),
      sourceKind: "email-attachment",
      parentFilename: parent.filename,
      parentBunnyPath: parent.bunnyPath,
      originalFilename,
    });
  });

  const bodyText = buildEmailBodyText(
    parent.filename,
    parsed,
    attachmentSummaries,
  );
  const bodyBytes = Buffer.from(bodyText, "utf8");

  return {
    documents: [
      {
        filename: `${parent.filename}__email-body.txt`,
        contentType: "text/plain",
        rawBytes: bodyBytes,
        documentHash: sha256(bodyBytes),
        sourceKind: "email-body",
        parentFilename: parent.filename,
        parentBunnyPath: parent.bunnyPath,
        originalFilename: parent.filename,
      },
      ...attachmentDocuments,
    ],
    skippedParts,
  };
}

function buildEmailBodyText(
  parentFilename: string,
  parsed: ParsedEmail,
  attachmentSummaries: EmailAttachmentSummary[],
): string {
  const attachments =
    attachmentSummaries.length > 0
      ? attachmentSummaries
          .map((attachment) => {
            const status = attachment.included
              ? `included as ${attachment.generatedFilename}`
              : `skipped (${attachment.reason ?? "unknown_reason"})`;
            return [
              `- ${attachment.originalFilename}`,
              attachment.contentType ? `type=${attachment.contentType}` : "",
              attachment.size != null ? `size=${attachment.size} bytes` : "",
              attachment.related ? "inline=true" : "",
              status,
            ]
              .filter(Boolean)
              .join("; ");
          })
          .join("\n")
      : "- none";

  const body = truncateEmailBody(parsed.bodyText);

  return [
    `Source email file: ${parentFilename}`,
    `Subject: ${parsed.subject || "(none)"}`,
    `From: ${parsed.from || "(unknown)"}`,
    `To: ${parsed.to || "(unknown)"}`,
    `Cc: ${parsed.cc || "(none)"}`,
    `Date: ${parsed.date || "(unknown)"}`,
    "",
    "Attachments:",
    attachments,
    "",
    "Body:",
    body || "(empty)",
  ].join("\n");
}

function normalizeEmlAttachment(
  attachment: Attachment,
  index: number,
): ParsedEmailAttachment {
  const bytes = Buffer.isBuffer(attachment.content)
    ? attachment.content
    : Buffer.from(attachment.content);

  return {
    filename: attachment.filename,
    contentType: attachment.contentType,
    bytes,
    size: attachment.size || bytes.byteLength,
    related: attachment.related,
  };
}

function formatMailparserAddress(
  address: AddressObject | AddressObject[] | undefined,
): string | undefined {
  const addresses = Array.isArray(address) ? address : address ? [address] : [];
  const text = addresses
    .map((entry) => entry.text)
    .filter((entry): entry is string => Boolean(entry?.trim()))
    .join(", ");

  return text || undefined;
}

function formatMsgSender(data: FieldsData): string | undefined {
  const email =
    data.senderSmtpAddress ??
    data.sentRepresentingSmtpAddress ??
    data.senderEmail ??
    data.creatorSMTPAddress;

  return formatNameAndEmail(data.senderName, email);
}

function formatMsgRecipients(
  recipients: FieldsData[] | undefined,
  type: "to" | "cc" | "bcc",
): string | undefined {
  const text = (recipients ?? [])
    .filter((recipient) => recipient.recipType === type)
    .map((recipient) =>
      formatNameAndEmail(
        recipient.name,
        recipient.smtpAddress ?? recipient.email,
      ),
    )
    .filter((entry): entry is string => Boolean(entry))
    .join(", ");

  return text || undefined;
}

function formatNameAndEmail(
  name: string | undefined,
  email: string | undefined,
): string | undefined {
  const cleanName = name?.trim();
  const cleanEmail = email?.trim();

  if (cleanName && cleanEmail && cleanName !== cleanEmail) {
    return `${cleanName} <${cleanEmail}>`;
  }

  return cleanEmail || cleanName || undefined;
}

function msgAttachmentFilename(attachment: FieldsData, index: number): string {
  return (
    attachment.fileName ||
    attachment.fileNameShort ||
    attachment.name ||
    `attachment-${index + 1}${attachment.extension || ""}`
  );
}

function attachmentFilename(
  attachment: ParsedEmailAttachment,
  index: number,
): string {
  const filename =
    attachment.filename?.trim() ||
    `attachment-${String(index + 1).padStart(2, "0")}${extensionForContentType(attachment.contentType)}`;

  return ensureFilenameExtension(filename, attachment.contentType);
}

function emailAttachmentDocumentFilename(
  parentFilename: string,
  originalFilename: string,
  index: number,
  contentType: string,
): string {
  const safeName = safeFilename(originalFilename);
  const filename = `${parentFilename}__attachment-${String(index + 1).padStart(2, "0")}-${safeName}`;
  return ensureFilenameExtension(filename, contentType);
}

function safeFilename(filename: string): string {
  const safeName = filename
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 160);

  return safeName || "attachment.bin";
}

function ensureFilenameExtension(
  filename: string,
  contentType?: string,
): string {
  if (/\.[a-z0-9]+$/i.test(filename)) {
    return filename;
  }

  return `${filename}${extensionForContentType(contentType)}`;
}

function extensionForContentType(contentType: string | undefined): string {
  switch (normalizeInputContentType(contentType, "")) {
    case "application/pdf":
      return ".pdf";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return ".pptx";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return ".xlsx";
    case "application/msword":
      return ".doc";
    case "application/vnd.ms-powerpoint":
      return ".ppt";
    case "application/vnd.ms-excel":
      return ".xls";
    case "application/vnd.oasis.opendocument.text":
      return ".odt";
    case "application/vnd.oasis.opendocument.presentation":
      return ".odp";
    case "application/vnd.oasis.opendocument.spreadsheet":
      return ".ods";
    case "application/rtf":
      return ".rtf";
    case "text/plain":
      return ".txt";
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    default:
      return ".bin";
  }
}

function normalizeEmailBodyText(text: string | undefined): string {
  return (text ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function truncateEmailBody(text: string): string {
  if (text.length <= MAX_EMAIL_BODY_CHARS) {
    return text;
  }

  return `${text.slice(0, MAX_EMAIL_BODY_CHARS)}\n\n[Email body truncated after ${MAX_EMAIL_BODY_CHARS} characters.]`;
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " "),
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

function decodeBytes(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

function sha256(bytes: Buffer): string {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
