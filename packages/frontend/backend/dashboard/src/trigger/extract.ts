import crypto from "node:crypto";
import { metadata, task } from "@trigger.dev/sdk/v3";
import { normalizeToPdf, pdfPageCount } from "../shared/converter/converter";
import { downloadFromBunny } from "../storage/bunny";
import {
  MAX_PDF_PAGES,
  type ExtractionConfig,
  extractFromPdf,
  extractTextFromPdf,
  scoreConfidence,
  toFunnelPrefill,
} from "../funnel-extraction/extraction";

export type ExtractPayload = {
  funnelSessionId: string;
  bunnyPath: string;
  filename: string;
  contentType: string;
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
  pageCount: number;
  totalTokens: { input: number; output: number };
  model: string;
};

export const extractFromDocument = task({
  id: "extract-from-document",
  maxDuration: 300,
  retry: { maxAttempts: 3, factor: 2, minTimeoutInMs: 2_000 },
  run: async (payload: ExtractPayload): Promise<ExtractOutput> => {
    metadata.set("status", "starting");
    metadata.set("step", "download");

    const { bytes: rawBytes, contentType: serverContentType } =
      await downloadFromBunny(payload.bunnyPath);
    const contentType = serverContentType || payload.contentType;
    const documentHash = crypto
      .createHash("sha256")
      .update(rawBytes)
      .digest("hex");

    metadata.set("documentHash", documentHash);
    metadata.set("step", "normalize");

    const { pdf } = await normalizeToPdf({
      bytes: rawBytes,
      contentType,
      filename: payload.filename,
    });
    const pageCount = await pdfPageCount(pdf);
    if (pageCount > MAX_PDF_PAGES) {
      throw new Error(`PDF has ${pageCount} pages; max is ${MAX_PDF_PAGES}.`);
    }

    metadata.set("pageCount", pageCount);
    metadata.set("step", "extract");

    const primary = await extractFromPdf({
      pdfBytes: pdf,
      filename: payload.filename,
      config: payload.extractionConfig,
      onPartialExtraction: (partialExtraction) => {
        metadata.set("partialExtraction", partialExtraction as any);
      },
    });

    metadata.set("partialExtraction", primary.extraction as any);
    metadata.set("step", "text_index");

    const documentText = await extractTextFromPdf(pdf);
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
        documentName: payload.filename,
      });

    metadata.set("status", "complete");

    return {
      extraction: primary.extraction,
      confidences,
      funnelPrefill,
      funnelConfidences,
      documentHash,
      pageCount,
      totalTokens: {
        input: primary.usage.input_tokens,
        output: primary.usage.output_tokens,
      },
      model: primary.model,
    };
  },
});
