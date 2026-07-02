import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import { rescheduleSubmit } from "@com.synergy/frontend-backend-dashboard/montageBooking";
import { requireMontageAdmin, json } from "../../_auth";

/**
 * Move a Submit's confirmed booking to a new start day (cancel old + book new,
 * atomically). A scheduling conflict maps to HTTP 409 so the client can re-pick.
 */
export async function POST(req: NextRequest) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  try {
    const { submitId, startDate, teamCount } = await req.json();
    if (!submitId || !startDate) {
      return json(
        { success: false, error: "submitId and startDate required" },
        400
      );
    }
    const result = await rescheduleSubmit({
      submitId,
      startDate,
      teamCount: teamCount ?? 1,
      createdBy: gate.admin.userId,
    });
    return json({ success: true, data: { bookingId: result.bookingId } }, 201);
  } catch (error: any) {
    if (error?.name === "ConflictError") {
      return json({ success: false, error: error.code }, 409);
    }
    return json({ success: false, error: String(error?.message ?? error) }, 400);
  }
}
