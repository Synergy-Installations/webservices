/**
 * Bunny.net helpers (Vercel-side only).
 *
 * Vercel's responsibilities collapsed to:
 *   1. Build a storage path
 *   2. Tell the browser where to PUT the file (the Bunny Edge Script endpoint)
 *   3. Download bytes inside the Trigger.dev worker
 *
 * The actual file body never passes through any Vercel route. Uploads go
 * direct: browser → Bunny Edge Script → Bunny Storage.
 *
 * Required env (Vercel / Trigger.dev):
 *   BUNNY_PULL_HOSTNAME       e.g. "cdn.synergie.cc" or "https://cdn.synergie.cc"
 *   BUNNY_UPLOAD_ENDPOINT     e.g. "https://upload.synergie.cc"
 *                             — the public hostname mapped to the Edge Script
 */

const PULL_HOSTNAME = process.env.BUNNY_PULL_HOSTNAME;
const UPLOAD_ENDPOINT = process.env.BUNNY_UPLOAD_ENDPOINT;

function publicBaseUrl(envName: string, value: string | undefined): string {
    const trimmed = value?.trim().replace(/\/+$/, "");
    if (!trimmed) {
        throw new Error(`${envName} is not configured.`);
    }
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function publicObjectUrl(path: string): string {
    const cleanPath = path.replace(/^\/+/, "");
    return `${publicBaseUrl("BUNNY_PULL_HOSTNAME", PULL_HOSTNAME)}/${cleanPath}`;
}

// --------------------------------------------------------------------------
//  Path generation
// --------------------------------------------------------------------------

export function buildUploadPath(opts: {
    funnelSessionId: string;
    filename: string;
}): string {
    const safeName = opts.filename
        .normalize("NFKD")
        .replace(/[^\w.\-]/g, "_")
        .slice(0, 200);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `funnel-uploads/${opts.funnelSessionId}/${stamp}-${safeName}`;
}

/**
 * The URL the browser PUTs to. The Edge Script is wired (via Bunny CDN
 * configuration) to a public hostname like `upload.synergie.cc`.
 */
export function uploadEndpoint(): string {
    return publicBaseUrl("BUNNY_UPLOAD_ENDPOINT", UPLOAD_ENDPOINT);
}

// --------------------------------------------------------------------------
//  Worker-side download — inside the Trigger.dev task
// --------------------------------------------------------------------------

export async function downloadFromBunny(path: string): Promise<{
    bytes: Buffer;
    contentType: string;
}> {
    const url = publicObjectUrl(path);
    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "*/*" },
    });
    if (!res.ok) {
        throw new Error(`Bunny GET ${res.status}: ${path}`);
    }
    const ab = await res.arrayBuffer();
    return {
        bytes: Buffer.from(ab),
        contentType: res.headers.get("content-type") ?? "application/octet-stream",
    };
}
