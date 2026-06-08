import Anthropic from "@anthropic-ai/sdk";
import type { PDFParse } from "pdf-parse";

// `pdf-parse` pulls in `pdfjs-dist/legacy`, whose `canvas.js` references the
// browser globals `DOMMatrix`/`ImageData`/`Path2D` at module-eval time. pdfjs'
// own polyfill relies on `process.getBuiltinModule`, which isn't available
// during Trigger.dev's task indexing nor in the deployed worker, so the import
// throws "DOMMatrix is not defined". We:
//   1. load it lazily, so it isn't evaluated during task indexing, and
//   2. seed the missing globals from `@napi-rs/canvas` (a dependency of
//      `pdf-parse`) before importing, so the deployed runtime can load pdfjs.
let pdfParseModule: Promise<typeof import("pdf-parse")> | undefined;
function loadPdfParse(): Promise<typeof import("pdf-parse")> {
  pdfParseModule ??= (async () => {
    await ensurePdfGlobals();
    return import("pdf-parse");
  })();
  return pdfParseModule;
}

async function ensurePdfGlobals(): Promise<void> {
  const globals = globalThis as Record<string, unknown>;
  const needed = ["DOMMatrix", "ImageData", "Path2D", "DOMPoint", "DOMRect"];
  if (needed.every((name) => name in globals)) {
    return;
  }

  const canvas = (await import("@napi-rs/canvas")) as unknown as Record<
    string,
    unknown
  >;
  for (const name of needed) {
    if (!(name in globals) && typeof canvas[name] === "function") {
      globals[name] = canvas[name];
    }
  }
}

export type ExtractionFieldType =
  | "number"
  | "text"
  | "single-option"
  | "multi-option";

export type ExtractionOptionConfig = {
  targetOptionUid: string;
  aliases?: string[];
};

export type ExtractionFieldConfig = {
  label: string;
  type: ExtractionFieldType;
  description: string;
  aliases?: string[];
  instructions?: string;
  unit?: string;
  min?: string;
  max?: string;
  target: {
    questionUid: string;
    formUid: string;
  };
  options?: Record<string, ExtractionOptionConfig>;
};

export type ExtractionConfig = {
  endpoint?: string;
  acceptText?: string;
  mimeTypes?: string[];
  confidence?: {
    green?: string;
    yellow?: string;
  };
  options?: {
    selfConsistencySamples?: string;
    runVerifier?: string;
  };
  statusLabels?: Record<string, string>;
  fields: Record<string, ExtractionFieldConfig>;
};

export type GroundedExtractionValue = {
  value: unknown | null;
  source_quote: string | null;
  source_page: number | null;
  source_document: string | null;
  reasoning: string | null;
};

export type ExtractionResult = Record<string, GroundedExtractionValue>;

export type PartialExtractionHandler = (
  extraction: ExtractionResult,
) => void | Promise<void>;

export type ExtractionDocument = {
  pdfBytes: Buffer;
  filename: string;
};

export type FunnelPrefillValue = {
  value: unknown;
  confidence: number;
  sourceQuote: string | null;
  sourcePage: number | null;
  fieldKey: string;
  documentName: string;
  label: string;
};

export type FunnelPrefill = Record<string, FunnelPrefillValue>;

const TOOL_NAME = "submit_extraction";
export const MAX_PDF_BYTES = 32 * 1024 * 1024;
export const MAX_PDF_PAGES = 100;

export async function extractFromPdf(opts: {
  pdfBytes: Buffer;
  filename: string;
  config: ExtractionConfig;
  onPartialExtraction?: PartialExtractionHandler;
}): Promise<{
  extraction: ExtractionResult;
  raw: Anthropic.Messages.Message;
  usage: { input_tokens: number; output_tokens: number };
  model: string;
}> {
  return extractFromPdfs({
    documents: [{ pdfBytes: opts.pdfBytes, filename: opts.filename }],
    config: opts.config,
    onPartialExtraction: opts.onPartialExtraction,
  });
}

export async function extractFromPdfs(opts: {
  documents: ExtractionDocument[];
  config: ExtractionConfig;
  onPartialExtraction?: PartialExtractionHandler;
}): Promise<{
  extraction: ExtractionResult;
  raw: Anthropic.Messages.Message;
  usage: { input_tokens: number; output_tokens: number };
  model: string;
}> {
  if (opts.documents.length === 0) {
    throw new Error("No documents supplied for extraction.");
  }

  opts.documents.forEach((document) => {
    if (document.pdfBytes.byteLength > MAX_PDF_BYTES) {
      throw new Error(
        `PDF too large: ${document.filename} has ${document.pdfBytes.byteLength} bytes (max ${MAX_PDF_BYTES})`,
      );
    }
  });

  const model = process.env.ANTHROPIC_EXTRACTION_MODEL ?? "claude-sonnet-4-6";
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
  const documentNames = opts.documents.map((document) => document.filename);

  const request = {
    model,
    max_tokens: 4096,
    temperature: 0,
    system: buildSystemPrompt(opts.config, documentNames),
    tools: [
      {
        name: TOOL_NAME,
        description:
          "Submit structured extraction data for the Synergie funnel.",
        input_schema: buildToolInputSchema(opts.config, documentNames) as any,
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [
      {
        role: "user",
        content: [
          ...opts.documents.map((document) => ({
            type: "document" as const,
            title: document.filename,
            source: {
              type: "base64" as const,
              media_type: "application/pdf" as const,
              data: document.pdfBytes.toString("base64"),
            },
          })),
          {
            type: "text",
            text: buildUserPrompt(documentNames),
          },
        ],
      },
    ],
  } satisfies Anthropic.Messages.MessageCreateParamsNonStreaming;

  const message = opts.onPartialExtraction
    ? await streamExtraction({
        anthropic,
        request,
        config: opts.config,
        onPartialExtraction: opts.onPartialExtraction,
      })
    : await anthropic.messages.create(request);

  const toolUse = message.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use",
  );

  if (!toolUse) {
    throw new Error(
      `Model did not call ${TOOL_NAME}. Stop reason: ${message.stop_reason}`,
    );
  }

  return {
    extraction: normalizeExtraction(toolUse.input, opts.config),
    raw: message,
    usage: {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
    },
    model,
  };
}

async function streamExtraction(opts: {
  anthropic: Anthropic;
  request: Anthropic.Messages.MessageCreateParamsNonStreaming;
  config: ExtractionConfig;
  onPartialExtraction: PartialExtractionHandler;
}): Promise<Anthropic.Messages.Message> {
  let lastSignature = "";
  let lastPublishedAt = 0;
  let publishedFields = new Set<string>();
  const stream = opts.anthropic.messages.stream(
    opts.request as Anthropic.Messages.MessageStreamParams,
  );

  stream.on("inputJson", (_partialJson, jsonSnapshot) => {
    const extraction = normalizeExtraction(jsonSnapshot, opts.config);
    const displayableFields = getDisplayableExtractionFields(extraction);
    if (displayableFields.length === 0) return;

    const signature = buildExtractionSignature(extraction, displayableFields);
    if (signature === lastSignature) return;

    const now = Date.now();
    const hasNewField = displayableFields.some(
      (fieldKey) => !publishedFields.has(fieldKey),
    );
    if (!hasNewField && now - lastPublishedAt < 250) return;

    lastSignature = signature;
    lastPublishedAt = now;
    publishedFields = new Set(displayableFields);
    try {
      void Promise.resolve(opts.onPartialExtraction(extraction)).catch(() => {
        // Streaming progress is best-effort; the final extraction still returns.
      });
    } catch {
      // Streaming progress is best-effort; the final extraction still returns.
    }
  });

  return stream.finalMessage();
}

function getDisplayableExtractionFields(
  extraction: ExtractionResult,
): string[] {
  return Object.entries(extraction)
    .filter(([, value]) => isDisplayableExtractionValue(value?.value))
    .map(([fieldKey]) => fieldKey);
}

function isDisplayableExtractionValue(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function buildExtractionSignature(
  extraction: ExtractionResult,
  fieldKeys: string[],
): string {
  return fieldKeys
    .map((fieldKey) => {
      const field = extraction[fieldKey];
      return `${fieldKey}:${JSON.stringify(field?.value)}:${field?.source_quote ?? ""}:${field?.source_page ?? ""}`;
    })
    .join("|");
}

export async function extractTextFromPdf(pdf: Buffer): Promise<string> {
  const { PDFParse } = await loadPdfParse();
  const parser = new PDFParse({ data: new Uint8Array(pdf) });
  try {
    const result = await parser.getText();
    return (result.text ?? "").trim();
  } finally {
    await parser.destroy();
  }
}

export function scoreConfidence(opts: {
  extraction: ExtractionResult;
  documentText: string;
  config: ExtractionConfig;
}): Record<string, number> {
  const normalizedDoc = normalizeForMatch(opts.documentText);
  return Object.fromEntries(
    Object.entries(opts.config.fields).map(([fieldKey, field]) => {
      const extracted = opts.extraction[fieldKey];
      if (!extracted || extracted.value == null) return [fieldKey, 0];

      const grounded = scoreQuoteGrounding(
        extracted.source_quote,
        normalizedDoc,
      );
      const derivable = scoreValueDerivable(field, extracted);
      return [fieldKey, roundConfidence(grounded * 0.7 + derivable * 0.3)];
    }),
  );
}

export function toFunnelPrefill(opts: {
  extraction: ExtractionResult;
  confidences: Record<string, number>;
  config: ExtractionConfig;
  documentName: string;
}): {
  values: FunnelPrefill;
  confidences: Record<string, number>;
} {
  const values: FunnelPrefill = {};
  const funnelConfidences: Record<string, number> = {};

  Object.entries(opts.config.fields).forEach(([fieldKey, field]) => {
    const extracted = opts.extraction[fieldKey];
    if (!extracted || extracted.value == null) return;

    const normalizedValue = normalizeValueForFunnel(field, extracted.value);
    if (normalizedValue == null) return;

    const confidence = opts.confidences[fieldKey] ?? 0;
    values[field.target.formUid] = {
      value: normalizedValue,
      confidence,
      sourceQuote: extracted.source_quote,
      sourcePage: extracted.source_page,
      fieldKey,
      documentName: extracted.source_document ?? opts.documentName,
      label: field.label,
    };
    funnelConfidences[field.target.formUid] = confidence;
  });

  return { values, confidences: funnelConfidences };
}

function buildToolInputSchema(
  config: ExtractionConfig,
  documentNames: string[] = [],
): Record<string, unknown> {
  return {
    type: "object",
    additionalProperties: false,
    required: Object.keys(config.fields),
    properties: Object.fromEntries(
      Object.entries(config.fields).map(([fieldKey, field]) => [
        fieldKey,
        {
          type: "object",
          description: buildFieldSchemaDescription(field),
          additionalProperties: false,
          required: [
            "value",
            "source_quote",
            "source_page",
            "source_document",
            "reasoning",
          ],
          properties: {
            value: valueSchemaForField(field),
            source_quote: nullable({ type: "string" }),
            source_page: nullable({ type: "integer", minimum: 1 }),
            source_document: nullable(
              Object.fromEntries(
                Object.entries({
                  type: "string",
                  enum: documentNames.length > 0 ? documentNames : undefined,
                  description:
                    "Exact uploaded filename that is the primary source for this value.",
                }).filter(([, value]) => value !== undefined),
              ),
            ),
            reasoning: nullable({ type: "string" }),
          },
        },
      ]),
    ),
  };
}

function valueSchemaForField(
  field: ExtractionFieldConfig,
): Record<string, unknown> {
  const description = buildValueSchemaDescription(field);

  if (field.type === "number") {
    return nullable({
      type: "number",
      description,
      minimum: field.min == null ? undefined : Number(field.min),
      maximum: field.max == null ? undefined : Number(field.max),
    });
  }

  if (field.type === "single-option") {
    return nullable({
      type: "string",
      description,
      enum: Object.keys(field.options ?? {}),
    });
  }

  if (field.type === "multi-option") {
    return nullable({
      type: "array",
      description,
      items: {
        type: "string",
        enum: Object.keys(field.options ?? {}),
      },
    });
  }

  return nullable({ type: "string", description });
}

function nullable(schema: Record<string, unknown>): Record<string, unknown> {
  return {
    oneOf: [
      Object.fromEntries(
        Object.entries(schema).filter(([, value]) => value !== undefined),
      ),
      { type: "null" },
    ],
  };
}

function buildSystemPrompt(
  config: ExtractionConfig,
  documentNames: string[] = [],
): string {
  const fieldLines = Object.entries(config.fields)
    .map(([fieldKey, field]) => {
      const aliasLine =
        field.aliases && field.aliases.length > 0
          ? `  Aliase/Suchbegriffe: ${field.aliases.join(", ")}`
          : "";
      const instructionLine = field.instructions
        ? `  Spezielle Extraktionsregel: ${field.instructions}`
        : "";
      const optionLines =
        field.options == null
          ? ""
          : Object.entries(field.options)
              .map(([optionKey, option]) => {
                const aliases = option.aliases?.join(", ") || optionKey;
                return `  - ${optionKey}: ${aliases}`;
              })
              .join("\n");

      return [
        `- ${fieldKey} (${field.label}, ${field.type}${field.unit ? `, ${field.unit}` : ""}): ${field.description}`,
        aliasLine,
        instructionLine,
        optionLines,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  const documentLines =
    documentNames.length > 0
      ? documentNames.map((name) => `- ${name}`).join("\n")
      : "- unbekannt";

  return `Du bist eine Extraktions-Engine fuer PV-Projektberichte im DACH-Raum.

Extrahiere strukturierte Werte fuer ein Montage-Onboarding-Funnel. Fuer jedes Feld musst du liefern:
- value: der Wert im konfigurierten Format
- source_quote: ein woertliches Zitat aus dem Dokument, das den Wert stuetzt
- source_page: die 1-indexierte Seite des Zitats
- source_document: der exakte Dateiname des primaeren Dokuments, das den Wert stuetzt
- reasoning: ein kurzer deutscher Satz zur Ableitung oder dazu, warum kein eindeutiger Wert gefunden wurde

Regeln:
1. Wenn ein Feld nicht eindeutig in den Dokumenten steht, setze value, source_quote, source_page und source_document auf null und erklaere in reasoning kurz, warum kein eindeutiger Wert gefunden wurde.
2. Erfinde keine plausiblen Werte.
3. source_quote muss aus dem Dokument stammen und darf nicht paraphrasiert werden.
4. Werte mit Einheiten muessen in die angegebene Zieleinheit umgerechnet werden.
5. source_document muss exakt einem der hochgeladenen Dateinamen entsprechen.
6. Wenn ein Wert aus mehreren Dokumenten abgeleitet wird, waehle als source_document das primaere Dokument mit der staerksten direkten Evidenz.

Hochgeladene Dateinamen:
${documentLines}

Konfigurierte Felder:
${fieldLines}`;
}

function buildUserPrompt(documentNames: string[]): string {
  if (documentNames.length === 1) {
    return `Dokument: ${documentNames[0]}\n\nExtrahiere alle konfigurierten Felder. Gib fuer value null zurueck, wenn ein Feld nicht eindeutig im Dokument vorhanden ist, und begruende kurz warum. Setze source_document auf den exakten Dateinamen, wenn ein Wert gefunden wurde.`;
  }

  return `Dokumente:\n${documentNames.map((name) => `- ${name}`).join("\n")}\n\nExtrahiere alle konfigurierten Felder aus dem gemeinsamen Kontext aller Dokumente. Gib fuer value null zurueck, wenn ein Feld nicht eindeutig vorhanden ist, und begruende kurz warum. Setze source_document auf den exakten Dateinamen des primaeren Dokuments, aus dem die Entscheidung stammt.`;
}

function buildFieldSchemaDescription(field: ExtractionFieldConfig): string {
  return [
    field.description,
    field.aliases?.length ? `Aliases: ${field.aliases.join(", ")}` : "",
    field.instructions ? `Instructions: ${field.instructions}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildValueSchemaDescription(field: ExtractionFieldConfig): string {
  return [
    `Extracted value for ${field.label}.`,
    field.unit ? `Return the value in ${field.unit}.` : "",
    field.instructions ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizeExtraction(
  input: unknown,
  config: ExtractionConfig,
): ExtractionResult {
  const raw = isRecord(input) ? input : {};

  return Object.fromEntries(
    Object.keys(config.fields).map((fieldKey) => {
      const field = raw[fieldKey];
      if (!isRecord(field)) {
        return [fieldKey, emptyGroundedValue()];
      }

      return [
        fieldKey,
        {
          value: field.value ?? null,
          source_quote:
            typeof field.source_quote === "string" ? field.source_quote : null,
          source_page:
            typeof field.source_page === "number" ? field.source_page : null,
          source_document:
            typeof field.source_document === "string"
              ? field.source_document
              : null,
          reasoning:
            typeof field.reasoning === "string" ? field.reasoning : null,
        },
      ];
    }),
  );
}

function emptyGroundedValue(): GroundedExtractionValue {
  return {
    value: null,
    source_quote: null,
    source_page: null,
    source_document: null,
    reasoning: null,
  };
}

function normalizeValueForFunnel(
  field: ExtractionFieldConfig,
  value: unknown,
): unknown | null {
  if (field.type === "number") {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  }

  if (field.type === "text") {
    return typeof value === "string" && value.trim() ? value.trim() : null;
  }

  if (field.type === "single-option") {
    if (typeof value !== "string") return null;
    const target = field.options?.[value]?.targetOptionUid;
    return target ? [target] : null;
  }

  if (field.type === "multi-option") {
    if (!Array.isArray(value)) return null;
    const targets = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => field.options?.[item]?.targetOptionUid)
      .filter((item): item is string => Boolean(item));
    return targets.length > 0 ? targets : null;
  }

  return null;
}

function scoreQuoteGrounding(
  sourceQuote: string | null,
  normalizedDoc: string,
): number {
  if (!sourceQuote) return 0;
  const quote = normalizeForMatch(sourceQuote);
  if (quote.length < 3) return 0;
  if (normalizedDoc.includes(quote)) return 1;

  const quoteTokens = new Set(
    quote.split(/\s+/).filter((token) => token.length > 2),
  );
  if (quoteTokens.size === 0) return 0;

  const docTokens = normalizedDoc.split(/\s+/);
  const windowSize = Math.max(5, quote.split(/\s+/).length);
  let best = 0;

  for (
    let i = 0;
    i + windowSize <= docTokens.length;
    i += Math.max(1, Math.floor(windowSize / 3))
  ) {
    const windowTokens = new Set(
      docTokens.slice(i, i + windowSize).filter((token) => token.length > 2),
    );
    const overlap = Array.from(quoteTokens).filter((token) =>
      windowTokens.has(token),
    ).length;
    best = Math.max(best, overlap / quoteTokens.size);
    if (best > 0.95) break;
  }

  return Math.min(0.85, best);
}

function scoreValueDerivable(
  field: ExtractionFieldConfig,
  extracted: GroundedExtractionValue,
): number {
  if (extracted.value == null || !extracted.source_quote) return 0;

  if (field.type === "number") {
    const value =
      typeof extracted.value === "number"
        ? extracted.value
        : Number(extracted.value);
    if (!Number.isFinite(value)) return 0;
    const numbers = parseNumbers(extracted.source_quote);
    if (numbers.length === 0) return 0.25;
    const tolerance = Math.max(0.05, Math.abs(value) * 0.05);
    return numbers.some(
      (number) =>
        Math.abs(number - value) <= tolerance ||
        Math.abs(number * 1000 - value) <= tolerance ||
        Math.abs(number / 1000 - value) <= tolerance,
    )
      ? 1
      : 0.35;
  }

  return extracted.source_quote.trim().length > 3 ? 1 : 0.4;
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s\u00a0]+/g, " ")
    .replace(/[„“”]/g, '"')
    .replace(/[–—]/g, "-")
    .trim();
}

function parseNumbers(value: string): number[] {
  const out: number[] = [];
  const re =
    /[-+]?(?:\d{1,3}(?:[\.\u00a0]\d{3})+|\d+)(?:[,.]\d+)?(?:[eE][-+]?\d+)?/g;

  for (const raw of value.match(re) ?? []) {
    const lastDot = raw.lastIndexOf(".");
    const lastComma = raw.lastIndexOf(",");
    const normalized =
      lastComma > lastDot
        ? raw
            .replace(/\./g, "")
            .replace(",", ".")
            .replace(/\u00a0/g, "")
        : raw.replace(/,/g, "").replace(/\u00a0/g, "");
    const number = Number(normalized);
    if (Number.isFinite(number)) out.push(number);
  }

  return out;
}

function roundConfidence(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 100) / 100;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
