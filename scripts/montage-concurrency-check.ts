/**
 * Verifies the Montagekalender concurrency guarantees against the live DB, then
 * cleans up after itself. Run with:  pnpm db:concurrency-check
 *
 *  1. Two parallel holds for the same day + a single free team ⇒ exactly one
 *     succeeds, the other throws SLOT_TAKEN.
 *  2. Confirming a hold whose day-docs are gone ⇒ HOLD_EXPIRED.
 */
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Team from "@com.synergy/frontend-backend-dashboard/team";
import TeamDayOccupancy from "@com.synergy/frontend-backend-dashboard/teamDayOccupancy";
import Booking from "@com.synergy/frontend-backend-dashboard/booking";
import {
  createHold,
  confirmBooking,
} from "@com.synergy/frontend-backend-dashboard/montageBooking";

const TEST_TEAM = "__concurrency_test__";
const START = "2027-03-01"; // far-future Monday, avoids real data

async function cleanup(teamIds: any[]) {
  if (teamIds.length) {
    await TeamDayOccupancy.deleteMany({ teamId: { $in: teamIds } });
    await Booking.deleteMany({ teamIds: { $in: teamIds } });
    await Team.deleteMany({ _id: { $in: teamIds } });
  }
}

async function main() {
  const conn = await dbConnect();
  const ObjectId = conn.Types.ObjectId;

  // Ensure exactly one active team is our test team; deactivate is not needed
  // because we only race a single team by giving createHold one active team.
  await Team.deleteMany({ name: TEST_TEAM });
  const preexistingActive = await Team.find({ active: true }).lean();
  if (preexistingActive.length > 0) {
    console.error(
      `Refusing to run: ${preexistingActive.length} active team(s) already exist; ` +
        `the single-free-team race needs a clean slate. Aborting without changes.`
    );
    await conn.disconnect();
    process.exit(2);
  }

  const team = await Team.create({ name: TEST_TEAM, color: "#000000", active: true });
  const teamIds = [team._id];

  try {
    const inquiryId = new ObjectId().toString();

    // 1) Race two holds for the same day.
    const [a, b] = await Promise.allSettled([
      createHold({ inquiryId, startDate: START, teamCount: 1, kWp: 10 }),
      createHold({ inquiryId, startDate: START, teamCount: 1, kWp: 10 }),
    ]);
    const fulfilled = [a, b].filter((r) => r.status === "fulfilled");
    const rejected = [a, b].filter((r) => r.status === "rejected");
    const slotTaken = rejected.filter(
      (r: any) => r.reason?.code === "SLOT_TAKEN"
    );

    console.log(
      `Race → fulfilled: ${fulfilled.length}, rejected(SLOT_TAKEN): ${slotTaken.length}`
    );
    const raceOk =
      fulfilled.length === 1 &&
      rejected.length === 1 &&
      slotTaken.length === 1;
    console.log(raceOk ? "  ✓ exactly one hold won the race" : "  ✗ RACE FAILED");

    // 2) Confirm after the hold's docs vanish ⇒ HOLD_EXPIRED.
    const winner = (fulfilled[0] as PromiseFulfilledResult<any>).value;
    await TeamDayOccupancy.deleteMany({ holdId: winner.holdId }); // simulate TTL
    let expiredOk = false;
    try {
      await confirmBooking({
        holdId: String(winner.holdId),
        snapshot: {
          teamCount: 1,
          leadTimeWeeks: 2,
          customerName: "Test",
          address: "Test",
          kWp: 10,
          components: [],
        },
      });
    } catch (e: any) {
      expiredOk = e?.code === "HOLD_EXPIRED";
    }
    console.log(
      expiredOk
        ? "  ✓ confirm after expiry threw HOLD_EXPIRED"
        : "  ✗ EXPIRY CHECK FAILED"
    );

    const pass = raceOk && expiredOk;
    console.log(pass ? "\nALL CHECKS PASSED" : "\nCHECKS FAILED");
    await cleanup(teamIds);
    await conn.disconnect();
    process.exit(pass ? 0 : 1);
  } catch (err) {
    await cleanup(teamIds);
    await conn.disconnect();
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
