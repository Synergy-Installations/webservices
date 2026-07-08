/**
 * Update the Montage Regelwerk on the settings singleton to the current duration
 * table (days per team by kWp). Only touches `durationRules` so admin-tuned lead
 * times / horizon stay intact. Run with the app env loaded:
 *   pnpm db:update-rules
 */
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import MontageSettings, {
  MONTAGE_SETTINGS_ID,
} from "@com.synergy/frontend-backend-dashboard/settings";
import {
  DEFAULT_MONTAGE_CONFIG,
  clearConfigCache,
} from "@com.synergy/frontend-backend-dashboard/montageConfig";

async function main() {
  const mongoose = await dbConnect();
  console.log("Connected. Updating durationRules on the settings singleton…");

  const res = await MontageSettings.updateOne(
    { _id: MONTAGE_SETTINGS_ID },
    { $set: { durationRules: DEFAULT_MONTAGE_CONFIG.durationRules } },
    { upsert: true }
  );
  clearConfigCache();

  const doc = await MontageSettings.findById(MONTAGE_SETTINGS_ID).lean();
  console.log("  matched/modified/upserted:", {
    matched: res.matchedCount,
    modified: res.modifiedCount,
    upserted: res.upsertedCount,
  });
  console.log("  durationRules now:", JSON.stringify((doc as any)?.durationRules));

  console.log("Done.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
