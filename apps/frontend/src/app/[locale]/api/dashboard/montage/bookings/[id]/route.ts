import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import { reassignBooking } from "@com.synergy/frontend-backend-dashboard/montageBooking";
import { requireMontageAdmin, json } from "../../_auth";

/** Reassign a booking from one team to another. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  try {
    const { fromTeamId, toTeamId } = await req.json();
    if (!fromTeamId || !toTeamId) {
      return json({ success: false, error: "fromTeamId and toTeamId required" }, 400);
    }
    await reassignBooking({ bookingId: params.id, fromTeamId, toTeamId });
    return json({ success: true });
  } catch (error: any) {
    if (error?.name === "ConflictError") {
      return json({ success: false, error: error.code }, 409);
    }
    return json({ success: false, error: String(error?.message ?? error) }, 400);
  }
}
