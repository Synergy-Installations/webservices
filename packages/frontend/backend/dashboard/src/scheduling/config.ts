import MontageSettings, {
  DurationRule,
  MONTAGE_SETTINGS_ID,
} from "@com.synergy/frontend-backend-dashboard/settings";

/**
 * The scheduling Regelwerk as a plain object (no Mongoose document methods),
 * safe to pass into the pure date/rules functions.
 */
export interface MontageConfig {
  workingWeekdays: number[];
  durationRules: DurationRule[];
  twoTeamHalving: boolean;
  bufferDays: number;
  leadBaseWeeks: number;
  leadHeavyWeeks: number;
  holdTtlMinutes: number;
  horizonDays: number;
  additionalNonWorkingDays: string[];
}

/**
 * Default Regelwerk shipped from the meetings. `maxKwp: null` marks the
 * unbounded catch-all tier. Refine the thresholds upward with Michael.
 */
export const DEFAULT_MONTAGE_CONFIG: MontageConfig = {
  workingWeekdays: [1, 2, 3, 4, 5],
  // Days per team (2 PAX), by system size. Bounds are "ab X kWp" (inclusive
  // lower) — see durationDaysPerTeam. Two teams halve the span (twoTeamHalving).
  durationRules: [
    { maxKwp: 20, daysPerTeam: 2 }, // Standardmontage: unter 20 kWp
    { maxKwp: 30, daysPerTeam: 3 }, // ab 20 kWp
    { maxKwp: 50, daysPerTeam: 4 }, // ab 30 kWp
    { maxKwp: 75, daysPerTeam: 5 }, // ab 50 kWp
    { maxKwp: 100, daysPerTeam: 7 }, // ab 75 kWp
    { maxKwp: null, daysPerTeam: 10 }, // ab 100 kWp
  ],
  twoTeamHalving: true,
  bufferDays: 0,
  leadBaseWeeks: 2,
  leadHeavyWeeks: 3,
  holdTtlMinutes: 15,
  horizonDays: 120,
  additionalNonWorkingDays: [],
};

/**
 * Upsert the singleton settings document with the default Regelwerk. Uses
 * `$setOnInsert` so re-running never clobbers values Michael has since tuned.
 */
export async function seedMontageSettings() {
  await MontageSettings.updateOne(
    { _id: MONTAGE_SETTINGS_ID },
    { $setOnInsert: { _id: MONTAGE_SETTINGS_ID, ...DEFAULT_MONTAGE_CONFIG } },
    { upsert: true }
  );
}

let cached: { value: MontageConfig; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

/**
 * Return the current Regelwerk, cached in-process for a short TTL. Falls back
 * to the defaults if the settings document has not been seeded yet.
 */
export async function getConfig(): Promise<MontageConfig> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.value;
  }

  const doc = await MontageSettings.findById(MONTAGE_SETTINGS_ID).lean<
    MontageConfig & { _id: string }
  >();

  const value: MontageConfig = doc
    ? {
        workingWeekdays: doc.workingWeekdays,
        durationRules: doc.durationRules,
        twoTeamHalving: doc.twoTeamHalving,
        bufferDays: doc.bufferDays,
        leadBaseWeeks: doc.leadBaseWeeks,
        leadHeavyWeeks: doc.leadHeavyWeeks,
        holdTtlMinutes: doc.holdTtlMinutes,
        horizonDays: doc.horizonDays,
        additionalNonWorkingDays: doc.additionalNonWorkingDays,
      }
    : DEFAULT_MONTAGE_CONFIG;

  cached = { value, at: Date.now() };
  return value;
}

/** Clear the in-process config cache (call after an admin edits the settings). */
export function clearConfigCache() {
  cached = null;
}
