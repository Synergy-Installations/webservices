import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Team from "@com.synergy/frontend-backend-dashboard/team";
import Booking from "@com.synergy/frontend-backend-dashboard/booking";
import TeamDayOccupancy from "@com.synergy/frontend-backend-dashboard/teamDayOccupancy";
import { requireMontageAdmin, json } from "../_auth";

/** Confirmed bookings + blocks overlapping [from, to], plus the team list. */
export async function GET(req: NextRequest) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const teamId = searchParams.get("teamId");
  if (!from || !to) {
    return json({ success: false, error: "from and to required" }, 400);
  }

  const teams = await Team.find({}).sort({ name: 1 }).lean();

  const bookingQuery: Record<string, unknown> = {
    status: "confirmed",
    startDate: { $lte: to },
    endDate: { $gte: from },
  };
  if (teamId) bookingQuery.teamIds = teamId;
  const bookings = await Booking.find(bookingQuery).lean();

  const blockQuery: Record<string, unknown> = {
    type: "block",
    dateKey: { $gte: from, $lte: to },
  };
  if (teamId) blockQuery.teamId = teamId;
  const blocks = await TeamDayOccupancy.find(blockQuery).lean();

  return json({ success: true, data: { teams, bookings, blocks } });
}
