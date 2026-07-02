/**
 * Idempotent setup for the Montagekalender: builds the indexes that enforce
 * scheduling correctness and seeds the default Regelwerk settings document.
 *
 * Run with the app's env loaded:
 *   pnpm db:ensure-indexes
 * (wired in the root package.json to `node --env-file=apps/frontend/.env.local`).
 */
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Team from "@com.synergy/frontend-backend-dashboard/team";
import TeamDayOccupancy from "@com.synergy/frontend-backend-dashboard/teamDayOccupancy";
import Booking from "@com.synergy/frontend-backend-dashboard/booking";
import MontageSettings from "@com.synergy/frontend-backend-dashboard/settings";
import { seedMontageSettings } from "@com.synergy/frontend-backend-dashboard/montageConfig";

async function main() {
  const mongoose = await dbConnect();
  console.log("Connected. Syncing indexes…");

  // syncIndexes creates missing indexes and drops obsolete ones — idempotent.
  for (const model of [Team, TeamDayOccupancy, Booking, MontageSettings]) {
    const result = await model.syncIndexes();
    console.log(`  ${model.modelName}: ${JSON.stringify(result)}`);
  }

  console.log("Seeding default Regelwerk settings…");
  await seedMontageSettings();

  console.log("Done.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
