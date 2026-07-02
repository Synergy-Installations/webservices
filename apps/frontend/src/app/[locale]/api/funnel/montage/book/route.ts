import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import { scheduleSubmit } from "@com.synergy/frontend-backend-dashboard/montageBooking";

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Public (unauthenticated) confirm for the funnel picker. Called right after the
 * Submit is created; kWp / components are re-derived server-side from the saved
 * Submit (trusted), never from the client. A race maps to HTTP 409 so the funnel
 * can ask the customer to re-pick. The booking is bound to the inquiry so it
 * appears on the admin calendar.
 */
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const { submitId, startDate } = await req.json();
    if (!submitId || !startDate) {
      return json(
        { success: false, error: "submitId and startDate required" },
        400
      );
    }
    const result = await scheduleSubmit({ submitId, startDate, teamCount: 1 });
    return json({ success: true, data: { bookingId: result.bookingId } }, 201);
  } catch (error: any) {
    if (error?.name === "ConflictError") {
      return json({ success: false, error: error.code }, 409);
    }
    return json({ success: false, error: String(error?.message ?? error) }, 400);
  }
}
