import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import { createBlock } from "@com.synergy/frontend-backend-dashboard/montageBooking";
import { requireMontageAdmin, json } from "../_auth";

/** Block a team over a date range (expands to working-day docs server-side). */
export async function POST(req: NextRequest) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  try {
    const { teamId, from, to, reason } = await req.json();
    if (!teamId || !from || !to) {
      return json({ success: false, error: "teamId, from, to required" }, 400);
    }
    const result = await createBlock({ teamId, from, to, reason });
    return json({ success: true, data: result }, 201);
  } catch (error: any) {
    if (error?.name === "ConflictError") {
      return json({ success: false, error: error.code }, 409);
    }
    return json({ success: false, error: String(error?.message ?? error) }, 400);
  }
}
