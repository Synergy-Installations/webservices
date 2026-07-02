import mongoose, { Document, Schema } from "mongoose";

/**
 * The Regelwerk (scheduling rules) as a single, editable configuration
 * document. It is a singleton keyed by a fixed string `_id`
 * ("montageScheduling") so there is exactly one config per environment.
 *
 * Note: the architecture doc expresses the catch-all duration tier with
 * `maxKwp: Infinity`. Infinity does not round-trip cleanly through BSON/JSON,
 * so the unbounded tier is stored as `maxKwp: null` and treated as "no upper
 * bound" by the rules layer.
 */
export interface DurationRule {
  maxKwp: number | null; // null = no upper bound (catch-all tier)
  daysPerTeam: number;
}

export interface MontageSettingsInterface extends Document<string> {
  _id: string;
  workingWeekdays: number[]; // Luxon weekday numbers: 1=Mon … 7=Sun
  durationRules: DurationRule[]; // first match where kWp <= maxKwp (null = any)
  twoTeamHalving: boolean; // 2 teams ⇒ ceil(daysPerTeam / teamCount)
  bufferDays: number;
  leadBaseWeeks: number; // no heavy material
  leadHeavyWeeks: number; // heavy material (Speicher/Notstrom …)
  holdTtlMinutes: number;
  horizonDays: number; // how far ahead the picker offers slots
  additionalNonWorkingDays: string[]; // company closures, "YYYY-MM-DD"
}

const DurationRuleSchema = new Schema<DurationRule>(
  {
    maxKwp: { type: Number, required: false, default: null },
    daysPerTeam: { type: Number, required: true },
  },
  { _id: false }
);

const MontageSettingsSchema = new Schema<MontageSettingsInterface>({
  _id: { type: String, required: true },
  workingWeekdays: { type: [Number], required: true, default: [1, 2, 3, 4, 5] },
  durationRules: { type: [DurationRuleSchema], required: true },
  twoTeamHalving: { type: Boolean, required: true, default: true },
  bufferDays: { type: Number, required: true, default: 0 },
  leadBaseWeeks: { type: Number, required: true, default: 2 },
  leadHeavyWeeks: { type: Number, required: true, default: 3 },
  holdTtlMinutes: { type: Number, required: true, default: 15 },
  horizonDays: { type: Number, required: true, default: 120 },
  additionalNonWorkingDays: { type: [String], required: true, default: [] },
});

export const MONTAGE_SETTINGS_ID = "montageScheduling";

export default mongoose.models.MontageSettings ||
  mongoose.model("MontageSettings", MontageSettingsSchema, "settings");
