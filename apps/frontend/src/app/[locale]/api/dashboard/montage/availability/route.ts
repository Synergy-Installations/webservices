import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { extractSubmitFields } from "@com.synergy/frontend-backend-dashboard/montageSubmitFields";
import {
  findAvailableStartDates,
  earliestStart,
} from "@com.synergy/frontend-backend-dashboard/montageAvailability";
import { leadTimeWeeks } from "@com.synergy/frontend-backend-dashboard/montageRules";
import { getConfig } from "@com.synergy/frontend-backend-dashboard/montageConfig";
import { getSubmitBooking } from "@com.synergy/frontend-backend-dashboard/montageBooking";
import { requireMontageAdmin, json } from "../_auth";

/**
 * Bookable start days for an existing Submit. kWp / components are derived
 * server-side from the Submit (never trusted from the client).
 */
export async function GET(req: NextRequest) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const submitId = searchParams.get("submitId");
  const teamCount = Number(searchParams.get("teamCount")) || 1;
  if (!submitId) {
    return json({ success: false, error: "submitId required" }, 400);
  }

  const submit = await Submit.findById(submitId).lean();
  if (!submit) return json({ success: false, error: "Submit not found" }, 404);

  const fields = extractSubmitFields(submit);
  const cfg = await getConfig();
  const [slots, existingBooking] = await Promise.all([
    findAvailableStartDates({
      kWp: fields.kWp,
      components: fields.components,
      teamCount,
    }),
    getSubmitBooking(submitId),
  ]);

  return json({
    success: true,
    data: {
      fields,
      teamCount,
      slots,
      existingBooking,
      earliestStart: earliestStart(fields.components, cfg),
      leadTimeWeeks: leadTimeWeeks(fields.components, cfg),
    },
  });
}
