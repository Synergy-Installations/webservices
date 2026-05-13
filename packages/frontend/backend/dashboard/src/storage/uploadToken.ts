/**
 * Upload token — HMAC-SHA-256 signed JSON, runtime-portable.
 *
 * Issued by:    Vercel Function (Node / Edge runtime)
 * Verified by:  Bunny Edge Script (Deno-compatible)
 *
 * Format: `${base64url(payload)}.${base64url(signature)}`
 *
 * The payload locks down exactly what the holder may upload:
 *   - path        — the storage path; token cannot be reused for another path
 *   - contentType — must match the PUT's Content-Type
 *   - maxBytes    — hard cap; Edge Script enforces via a counting TransformStream
 *   - exp         — unix seconds; defaults to 10 min
 *
 * No other validation lives in the token. Authn (user is logged in / has a
 * valid funnel session) happens at the Vercel route that *issues* tokens.
 *
 * Why Web Crypto and not Node's `crypto` module:
 *   The same code runs in Bunny Edge Scripts (no Node API). Web Crypto's
 *   `subtle.verify` is also constant-time by construction — we don't need
 *   our own `timingSafeEqual`.
 */

export type UploadTokenPayload = {
    path: string;
    contentType: string;
    maxBytes: number;
    exp: number; // unix seconds
};

// --------------------------------------------------------------------------
//  base64url helpers — Web Crypto wants Uint8Array, JSON wants strings
// --------------------------------------------------------------------------

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
    // btoa requires a string of single-byte chars. Build it without spreading
    // into a giant arg list (which crashes on big buffers).
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64u: string): Uint8Array {
    const padded =
        b64u.replace(/-/g, "+").replace(/_/g, "/") +
        "===".slice((b64u.length + 3) % 4);
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

// --------------------------------------------------------------------------
//  Key import — cached per process
// --------------------------------------------------------------------------

let cachedKey: { secret: string; key: CryptoKey } | null = null;

async function getKey(secret: string): Promise<CryptoKey> {
    if (cachedKey?.secret === secret) return cachedKey.key;
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
    );
    cachedKey = { secret, key };
    return key;
}

// --------------------------------------------------------------------------
//  Issue / verify
// --------------------------------------------------------------------------

export async function issueUploadToken(
    payload: UploadTokenPayload,
    secret: string,
): Promise<string> {
    const json = JSON.stringify(payload);
    const body = enc.encode(json);
    const key = await getKey(secret);
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, body));
    return `${toBase64Url(body)}.${toBase64Url(sig)}`;
}

export async function verifyUploadToken(
    token: string,
    secret: string,
): Promise<UploadTokenPayload | null> {
    const dot = token.indexOf(".");
    if (dot < 0) return null;
    const bodyB64 = token.slice(0, dot);
    const sigB64 = token.slice(dot + 1);

    let body: Uint8Array, sig: Uint8Array;
    try {
        body = fromBase64Url(bodyB64);
        sig = fromBase64Url(sigB64);
    } catch {
        return null;
    }

    const key = await getKey(secret);
    const ok = await crypto.subtle.verify("HMAC", key, sig as BufferSource, body as BufferSource);
    if (!ok) return null;

    let parsed: UploadTokenPayload;
    try {
        parsed = JSON.parse(dec.decode(body)) as UploadTokenPayload;
    } catch {
        return null;
    }

    if (typeof parsed.exp !== "number") return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
}
