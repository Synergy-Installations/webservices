/**
 * Bunny Edge Script — direct-upload proxy.
 *
 * Deploy this as a Standalone Bunny Edge Script and attach your upload
 * hostname to the script's generated pull zone (e.g. `upload.synergie.cc`).
 * Do not create a separate CDN pull-zone whose origin is another Bunny CDN
 * hostname; that CDN-to-CDN hop is what commonly produces Bunny's
 * "508 Loop Detected" response.
 *
 * The browser PUTs files straight to this script. The Vercel API issues a
 * short-lived HMAC-signed token which this script verifies before forwarding
 * the body upstream to Bunny Storage with the AccessKey header.
 *
 * Why this exists:
 *   - Vercel's serverless functions cap request bodies at 4.5 MB (Hobby)
 *     / 50 MB (Pro). PV reports routinely exceed both.
 *   - Bunny Storage doesn't support presigned PUT URLs (the AccessKey
 *     header is required on every write). Putting the AccessKey in client
 *     code is unacceptable.
 *   - This script is the smallest possible thing that bridges those:
 *     a token-gated streaming reverse proxy at Bunny's edge.
 *
 * Notes on Bunny Edge Scripts:
 *   - Runtime is Deno-compatible. `fetch`, `Request`, `Response`,
 *     `crypto.subtle`, `ReadableStream`, `TransformStream` all work.
 *   - Standalone scripts are registered through `BunnySDK.net.http.serve`.
 *   - Env access pattern varies between Bunny's "Edge Scripting" generations.
 *     This file uses a `getEnv()` shim — adjust the body to whatever your
 *     Bunny dashboard exposes (env var, secret binding, or inline constant).
 *   - The script must respond to CORS preflights since the browser uploads
 *     cross-origin from your funnel domain.
 *
 * Required env (set in Bunny dashboard):
 *   BUNNY_STORAGE_ZONE        e.g. "synergy-webservices-assets"
 *   BUNNY_STORAGE_REGION      "" | "ny" | "la" | "sg" | "syd" | "br" | "jh" | "uk"
 *   BUNNY_STORAGE_ACCESS_KEY  storage zone password
 *   UPLOAD_TOKEN_SECRET       same value as on Vercel
 *   ALLOWED_ORIGIN            e.g. "https://synergie.cc"  (or comma-separated list)
 */

import * as BunnySDK from "@bunny.net/edgescript-sdk";

// --------------------------------------------------------------------------
//  Env access shim — adjust to your Bunny Edge Scripting runtime
// --------------------------------------------------------------------------

function getEnv(name: string): string {
  // Try every plausible binding pattern; one of these will work in your
  // Bunny dashboard. If none do, hard-code the values temporarily and ask
  // Bunny support which binding to use.
  // @ts-expect-error — runtime-specific globals
  if (typeof Deno !== "undefined" && Deno.env?.get)
    return Deno.env.get(name) ?? "";
  // @ts-expect-error
  if (typeof process !== "undefined" && process.env?.[name])
    return process.env[name];
  const injected = (globalThis as Record<string, unknown>)[name];
  if (typeof injected === "string") return injected;
  return "";
}

const BUNNY_STORAGE_ZONE = getEnv("BUNNY_STORAGE_ZONE");
const BUNNY_STORAGE_REGION = getEnv("BUNNY_STORAGE_REGION");
const BUNNY_STORAGE_ACCESS_KEY = getEnv("BUNNY_STORAGE_ACCESS_KEY");
const UPLOAD_TOKEN_SECRET = getEnv("UPLOAD_TOKEN_SECRET");
const ALLOWED_ORIGIN = getEnv("ALLOWED_ORIGIN");

function storageHostnameFromRegion(regionOrEndpoint: string): string {
  const value = regionOrEndpoint
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  if (!value || value === "de") return "storage.bunnycdn.com";
  if (value === "storage.bunnycdn.com") return value;
  if (value.endsWith(".storage.bunnycdn.com")) return value;
  return `${value}.storage.bunnycdn.com`;
}

const STORAGE_HOSTNAME = storageHostnameFromRegion(BUNNY_STORAGE_REGION);

const ALLOWED_ORIGINS = new Set(
  ALLOWED_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const REQUIRED_CONFIG = [
  ["BUNNY_STORAGE_ZONE", BUNNY_STORAGE_ZONE],
  ["BUNNY_STORAGE_ACCESS_KEY", BUNNY_STORAGE_ACCESS_KEY],
  ["UPLOAD_TOKEN_SECRET", UPLOAD_TOKEN_SECRET],
] as const;

// --------------------------------------------------------------------------
//  Token verification — Web Crypto, identical algo to lib/upload-token.ts
// --------------------------------------------------------------------------

type Payload = {
  path: string;
  contentType: string;
  maxBytes: number;
  exp: number;
};

const enc = new TextEncoder();
const dec = new TextDecoder();

function fromB64Url(s: string): Uint8Array {
  const padded =
    s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

let cachedKey: CryptoKey | null = null;
async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(UPLOAD_TOKEN_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return cachedKey;
}

async function verifyToken(token: string): Promise<Payload | null> {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  let body: Uint8Array, sig: Uint8Array;
  try {
    body = fromB64Url(token.slice(0, dot));
    sig = fromB64Url(token.slice(dot + 1));
  } catch {
    return null;
  }
  const key = await getKey();
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    sig as unknown as BufferSource,
    body as unknown as BufferSource,
  );
  if (!ok) return null;
  let payload: Payload;
  try {
    payload = JSON.parse(dec.decode(body));
  } catch {
    return null;
  }
  if (typeof payload.path !== "string") return null;
  if (typeof payload.contentType !== "string") return null;
  if (!Number.isFinite(payload.maxBytes) || payload.maxBytes <= 0) return null;
  if (typeof payload.exp !== "number") return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// --------------------------------------------------------------------------
//  CORS helpers
// --------------------------------------------------------------------------

function corsHeaders(
  origin: string | null,
  requestHeaders?: string | null,
): Record<string, string> {
  const allowed =
    origin && ALLOWED_ORIGINS.has(origin)
      ? origin
      : ([...ALLOWED_ORIGINS][0] ?? "*");
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "PUT, OPTIONS",
    "Access-Control-Allow-Headers":
      requestHeaders || "Content-Type, X-Upload-Token",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "CDN-Cache-Control": "no-store",
    Vary: "Origin, Access-Control-Request-Headers",
  };
}

function json(
  status: number,
  body: Record<string, unknown>,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function missingConfig(): string[] {
  return REQUIRED_CONFIG.filter(([, value]) => !value).map(([name]) => name);
}

// --------------------------------------------------------------------------
//  Path helpers
// --------------------------------------------------------------------------

function normalizeStoragePath(path: unknown): string | null {
  if (typeof path !== "string") return null;

  const normalized = path.trim().replace(/^\/+/, "");
  if (!normalized || normalized.includes("?") || normalized.includes("#")) {
    return null;
  }

  const parts = normalized.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    return null;
  }

  return normalized;
}

function requestPath(request: Request): string | null {
  const pathname = new URL(request.url).pathname.replace(/^\/+/, "");
  if (!pathname) return null;

  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

function encodePathSegments(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function storageUrl(storagePath: string): string {
  return `https://${STORAGE_HOSTNAME}/${encodeURIComponent(BUNNY_STORAGE_ZONE)}/${encodePathSegments(
    storagePath,
  )}`;
}

// --------------------------------------------------------------------------
//  Content-Type helpers
// --------------------------------------------------------------------------

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
};

function normalizeContentTypeHeader(contentType: string | null): string {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  return MIME_ALIASES[normalized] ?? normalized;
}

function contentTypesMatch(
  requestContentType: string | null,
  tokenContentType: string,
): boolean {
  return (
    normalizeContentTypeHeader(requestContentType) ===
    normalizeContentTypeHeader(tokenContentType)
  );
}

// --------------------------------------------------------------------------
//  Body size enforcement — TransformStream that aborts at maxBytes
// --------------------------------------------------------------------------

function sizeLimitStream(
  maxBytes: number,
): TransformStream<Uint8Array, Uint8Array> {
  let total = 0;
  return new TransformStream({
    transform(chunk, controller) {
      total += chunk.byteLength;
      if (total > maxBytes) {
        controller.error(new Error(`payload exceeds ${maxBytes} bytes`));
        return;
      }
      controller.enqueue(chunk);
    },
  });
}

// --------------------------------------------------------------------------
//  Main handler
// --------------------------------------------------------------------------

BunnySDK.net.http.serve(handle);

async function handle(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(
        origin,
        request.headers.get("access-control-request-headers"),
      ),
    });
  }

  if (request.method !== "PUT") {
    return json(405, { error: "method_not_allowed" }, origin);
  }

  const configErrors = missingConfig();
  if (configErrors.length > 0) {
    return json(
      500,
      { error: "missing_config", missing: configErrors },
      origin,
    );
  }

  // Origin guard — reject browser uploads from unknown origins
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json(403, { error: "origin_not_allowed" }, origin);
  }

  const token = request.headers.get("x-upload-token");
  if (!token) return json(401, { error: "missing_token" }, origin);

  const payload = await verifyToken(token);
  if (!payload) return json(401, { error: "invalid_or_expired_token" }, origin);

  const storagePath = normalizeStoragePath(payload.path);
  if (!storagePath) return json(400, { error: "invalid_path" }, origin);

  // The current frontend PUTs to the bare endpoint and relies on the signed
  // token path. If callers include `/path` in the URL, make sure it matches
  // the signed token instead of letting a token be replayed against a new path.
  const urlPath = requestPath(request);
  if (urlPath && urlPath !== storagePath) {
    return json(
      403,
      { error: "path_mismatch", expected: storagePath, got: urlPath },
      origin,
    );
  }

  const contentType = request.headers.get("content-type");
  if (!contentType || !contentTypesMatch(contentType, payload.contentType)) {
    return json(
      400,
      {
        error: "content_type_mismatch",
        expected: payload.contentType,
        got: contentType,
      },
      origin,
    );
  }

  // Belt-and-suspenders content-length check (some clients omit it on streamed PUTs)
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(declaredLength) || declaredLength < 0) {
    return json(400, { error: "invalid_content_length" }, origin);
  }

  if (declaredLength > 0 && declaredLength > payload.maxBytes) {
    return json(413, { error: "too_large", max: payload.maxBytes }, origin);
  }

  if (!request.body) {
    return json(400, { error: "missing_body" }, origin);
  }

  // Stream the body through a size-limited transform to upstream Bunny Storage.
  // If the body exceeds maxBytes mid-stream, the TransformStream errors and
  // the upstream PUT aborts with a network error.
  const limited = request.body.pipeThrough(sizeLimitStream(payload.maxBytes));

  const upstreamUrl = storageUrl(storagePath);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_STORAGE_ACCESS_KEY,
        "Content-Type": payload.contentType,
        // Forward content-length if the browser sent one
        ...(declaredLength > 0
          ? { "Content-Length": String(declaredLength) }
          : {}),
      },
      // @ts-expect-error — `duplex: "half"` is required for streaming bodies
      // in fetch on most modern runtimes but not yet in lib.dom.d.ts
      duplex: "half",
      body: limited,
    });
  } catch (err) {
    // Stream aborted by sizeLimitStream, or upstream network failure
    return json(502, { error: "upstream_failed", detail: String(err) }, origin);
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "<no body>");
    return json(
      upstream.status,
      { error: "upstream_rejected", status: upstream.status, detail: text },
      origin,
    );
  }

  return json(200, { ok: true, path: payload.path }, origin);
}
