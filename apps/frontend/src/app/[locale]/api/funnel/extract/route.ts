import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getExtractionConfig } from "@com.synergy/frontend-backend-dashboard/funnelExtractionConfig";
import type { extractFromDocument } from "@com.synergy/frontend-backend-dashboard/trigger/extract";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({
  funnelSessionId: z.string().min(8).max(128),
  bunnyPath: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  extractionQuestionUid: z.string().min(1),
  extractionFormUid: z.string().min(1),
  options: z
    .object({
      selfConsistencySamples: z.number().int().min(0).max(5).optional(),
      runVerifier: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { locale: string } },
) {
  let parsed: z.infer<typeof Body>;

  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "invalid_body", detail: String(err) },
      { status: 400 },
    );
  }

  let extractionConfig;
  try {
    extractionConfig = getExtractionConfig({
      locale: params.locale,
      extractionQuestionUid: parsed.extractionQuestionUid,
      extractionFormUid: parsed.extractionFormUid,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "missing_extraction_config", detail: String(err) },
      { status: 400 },
    );
  }

  const idempotencyKey = `${parsed.funnelSessionId}::${parsed.bunnyPath}`;
  const handle = await tasks.trigger<typeof extractFromDocument>(
    "extract-from-document",
    {
      funnelSessionId: parsed.funnelSessionId,
      bunnyPath: parsed.bunnyPath,
      filename: parsed.filename,
      contentType: parsed.contentType,
      extractionConfig,
      options: parsed.options,
    },
    { idempotencyKey, idempotencyKeyTTL: "1h" },
  );

  return NextResponse.json({
    runId: handle.id,
    publicAccessToken: (handle as any).publicAccessToken,
  });
}
