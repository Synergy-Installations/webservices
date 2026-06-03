import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getExtractionConfig } from "@com.synergy/frontend-backend-dashboard/funnelExtractionConfig";
import type { extractFromDocument } from "@com.synergy/frontend-backend-dashboard/trigger/extract";

export const runtime = "nodejs";
export const maxDuration = 30;

const DocumentBody = z.object({
  bunnyPath: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

const Body = z
  .object({
    funnelSessionId: z.string().min(8).max(128),
    documents: z.array(DocumentBody).min(1).max(20).optional(),
    bunnyPath: z.string().min(1).optional(),
    filename: z.string().min(1).optional(),
    contentType: z.string().min(1).optional(),
    extractionQuestionUid: z.string().min(1),
    extractionFormUid: z.string().min(1),
    options: z
      .object({
        selfConsistencySamples: z.number().int().min(0).max(5).optional(),
        runVerifier: z.boolean().optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.documents?.length) return;
    if (value.bunnyPath && value.filename && value.contentType) return;

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide documents[] or bunnyPath/filename/contentType.",
    });
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

  const documents = parsed.documents ?? [
    {
      bunnyPath: parsed.bunnyPath!,
      filename: parsed.filename!,
      contentType: parsed.contentType!,
    },
  ];

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

  const documentHash = crypto
    .createHash("sha256")
    .update(
      documents
        .map((document) => document.bunnyPath)
        .sort()
        .join("|"),
    )
    .digest("hex")
    .slice(0, 32);
  const idempotencyKey = `${parsed.funnelSessionId}::${documentHash}`;
  const handle = await tasks.trigger<typeof extractFromDocument>(
    "extract-from-document",
    {
      funnelSessionId: parsed.funnelSessionId,
      documents,
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
