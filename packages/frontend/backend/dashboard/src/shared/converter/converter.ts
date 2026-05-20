/**
 * Document normalization layer.
 *
 * Anthropic's `document` content block only accepts PDFs natively (and
 * plain text). PPTX, DOCX, ODT etc. must be converted upstream. We use
 * Gotenberg (https://gotenberg.dev) — a Docker service wrapping LibreOffice
 * + Chromium with a clean HTTP API — running on Fly.io, Railway, or as a
 * sidecar.
 *
 * Why not the AI SDK file extractors (mammoth/pptx-parser):
 *   PV reports often pack critical specs (kWp tables, single-line diagrams,
 *   datasheets) into slide tables, embedded images, and complex grid layouts.
 *   Pre-extracted text loses spatial relationships and frequently mangles
 *   table cells. Rendering to PDF preserves the visual layout that Claude's
 *   multimodal pipeline can reason over.
 *
 * If you can't run Gotenberg, swap in `@vercel/blob` + `convert-api`,
 * CloudConvert, or LibreOffice on a long-running container. The interface
 * stays identical.
 *
 * Required env:
 *   GOTENBERG_URL      e.g. "https://gotenberg.synergie.cc"
 *   GOTENBERG_API_KEY  Bearer token expected by the Caddy auth gate in front
 *                      of Gotenberg (must equal the GOTENBERG_API_KEY secret
 *                      set on the Bunny Magic Container)
 */

const GOTENBERG_URL = process.env.GOTENBERG_URL!;
const GOTENBERG_API_KEY = process.env.GOTENBERG_API_KEY;

export const SUPPORTED_INPUTS = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/msword",
  "application/vnd.ms-powerpoint",
  "application/vnd.ms-excel",
  "application/vnd.oasis.opendocument.text", // .odt
  "application/vnd.oasis.opendocument.presentation", // .odp
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "application/rtf",
  "text/plain",
  "image/jpeg",
  "image/png",
] as const;

export type SupportedMime = (typeof SUPPORTED_INPUTS)[number];

const GENERIC_CONTENT_TYPES = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
]);

const MIME_ALIASES: Record<string, SupportedMime> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
};

const EXTENSION_CONTENT_TYPES: Record<string, SupportedMime> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  doc: "application/msword",
  ppt: "application/vnd.ms-powerpoint",
  xls: "application/vnd.ms-excel",
  odt: "application/vnd.oasis.opendocument.text",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  rtf: "application/rtf",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

const DEFAULT_EXTENSION: Record<SupportedMime, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/msword": ".doc",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.oasis.opendocument.text": ".odt",
  "application/vnd.oasis.opendocument.presentation": ".odp",
  "application/vnd.oasis.opendocument.spreadsheet": ".ods",
  "application/rtf": ".rtf",
  "text/plain": ".txt",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export function isSupportedInput(mime: string): mime is SupportedMime {
  return (SUPPORTED_INPUTS as readonly string[]).includes(mime);
}

export function normalizeInputContentType(
  contentType: string | null | undefined,
  filename?: string,
): SupportedMime | null {
  const normalized = normalizeContentTypeHeader(contentType);
  const aliased = MIME_ALIASES[normalized] ?? normalized;

  if (isSupportedInput(aliased)) {
    return aliased;
  }

  if (!GENERIC_CONTENT_TYPES.has(aliased)) {
    return null;
  }

  const extension = extensionFromFilename(filename);
  return extension ? (EXTENSION_CONTENT_TYPES[extension] ?? null) : null;
}

function normalizeContentTypeHeader(
  contentType: string | null | undefined,
): string {
  return (contentType ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
}

function extensionFromFilename(
  filename: string | null | undefined,
): string | null {
  const match = filename
    ?.trim()
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

function filenameWithExtension(
  filename: string,
  contentType: SupportedMime,
): string {
  if (extensionFromFilename(filename)) {
    return filename;
  }

  return `${filename}${DEFAULT_EXTENSION[contentType]}`;
}

// --------------------------------------------------------------------------
//  Public API: take any supported input → return a PDF buffer
// --------------------------------------------------------------------------

export async function normalizeToPdf(opts: {
  bytes: Buffer;
  contentType: string;
  filename: string;
}): Promise<{ pdf: Buffer; pageCount?: number }> {
  const contentType = normalizeInputContentType(
    opts.contentType,
    opts.filename,
  );
  if (!contentType) {
    throw new Error(
      `Unsupported content type: ${opts.contentType}. Add it to SUPPORTED_INPUTS or pre-convert.`,
    );
  }

  if (contentType === "application/pdf") {
    // Already a PDF. Don't re-encode.
    return { pdf: opts.bytes };
  }

  return await convertViaGotenberg({
    ...opts,
    contentType,
    filename: filenameWithExtension(opts.filename, contentType),
  });
}

// --------------------------------------------------------------------------
//  Gotenberg LibreOffice route
// --------------------------------------------------------------------------

async function convertViaGotenberg(opts: {
  bytes: Buffer;
  contentType: string;
  filename: string;
}): Promise<{ pdf: Buffer }> {
  const form = new FormData();
  // Filename must include the extension — Gotenberg dispatches on it.
  form.append(
    "files",
    new Blob([new Uint8Array(opts.bytes)], { type: opts.contentType }),
    opts.filename,
  );
  // PDF/A-2b is the safest archive format and tends to be the best-rendered
  // for Claude's multimodal pipeline (proper text layer + page metadata).
  form.append("pdfa", "PDF/A-2b");
  // Disable JavaScript-driven layout for deterministic output.
  form.append("skipNetworkIdleEvent", "true");

  const headers: Record<string, string> = {};
  if (GOTENBERG_API_KEY) {
    headers.Authorization = `Bearer ${GOTENBERG_API_KEY}`;
  }

  const res = await fetch(`${GOTENBERG_URL}/forms/libreoffice/convert`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    throw new Error(
      `Gotenberg ${res.status}: ${await res.text().catch(() => "<no body>")}`,
    );
  }

  const ab = await res.arrayBuffer();
  return { pdf: Buffer.from(ab) };
}

// --------------------------------------------------------------------------
//  Page-count utility — used to gate Anthropic's 100-page input limit
// --------------------------------------------------------------------------

export async function pdfPageCount(pdf: Buffer): Promise<number> {
  // Cheap heuristic that doesn't require pulling pdf-lib into the bundle:
  // count `/Type /Page` (with whitespace tolerance, excluding `/Pages`).
  // For exact counts in production, use `pdf-lib` or `pdfjs-dist`.
  const haystack = pdf.toString("latin1");
  const matches = haystack.match(/\/Type\s*\/Page(?!s)/g);
  return matches?.length ?? 0;
}
