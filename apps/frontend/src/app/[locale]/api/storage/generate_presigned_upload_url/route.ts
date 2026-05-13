/**
 * POST /api/upload-url
 *
 * Issues a short-lived HMAC-signed token + the Bunny Edge Script endpoint.
 * The browser uses these to PUT the file directly to Bunny — no file body
 * ever passes through Vercel.
 *
 * This route runs in Vercel's Edge runtime since it does no Node-specific
 * work; that gives the lowest possible latency for the funnel UX.
 *
 * Request body: { filename, contentType, size, funnelSessionId }
 * Response:     { token, uploadUrl, path, expiresAt }
 *
 * Add your funnel auth check (cookie, session) before issuing tokens —
 * otherwise anyone can mint upload tokens against your storage zone.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildUploadPath, uploadEndpoint } from "@com.synergy/frontend-backend-dashboard/bunny";
import { issueUploadToken } from "@com.synergy/frontend-backend-dashboard/uploadToken";
import { isSupportedInput } from "@com.synergy/frontend-backend-dashboard/converter";

export const runtime = "edge";

const Body = z.object({
    filename: z.string().min(1).max(300),
    contentType: z.string(),
    size: z.number().int().min(1).max(100 * 1024 * 1024), // 100 MB ceiling
    funnelSessionId: z.string().min(8).max(128),
});

const TOKEN_TTL_SECONDS = 10 * 60; // 10 min

export async function POST(req: NextRequest) {
    let parsed: z.infer<typeof Body>;
    try {
        parsed = Body.parse(await req.json());
    } catch (err) {
        return NextResponse.json(
            { error: "invalid_body", detail: String(err) },
            { status: 400 },
        );
    }

    if (!isSupportedInput(parsed.contentType)) {
        return NextResponse.json(
            { error: "unsupported_content_type", contentType: parsed.contentType },
            { status: 415 },
        );
    }

    // TODO: assert funnel session is authenticated. Without this check,
    // anyone with the URL can use your storage zone for free.
    // Example:
    //   const session = await getSessionFromCookie(req);
    //   if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const path = buildUploadPath({
        funnelSessionId: parsed.funnelSessionId,
        filename: parsed.filename,
    });

    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const token = await issueUploadToken(
        {
            path,
            contentType: parsed.contentType,
            maxBytes: parsed.size,
            exp,
        },
        process.env.UPLOAD_TOKEN_SECRET!,
    );

    return NextResponse.json({
        token,
        // Browser PUTs to `${uploadUrl}/${path}` — the Edge Script reads
        // path from the request URL since the token-bound path must match it.
        uploadUrl: uploadEndpoint(),
        path,
        expiresAt: exp,
    });
}
