import type { MontageConfig } from "./config";

/**
 * Working days one team needs for a job of `kWp` size — the first duration rule
 * whose `maxKwp` bound the size falls *strictly under* (`maxKwp: null` = no upper
 * bound). Bounds are exclusive-upper so an "ab 20 kWp" tier owns exactly 20 kWp:
 * rules `[{20,2},{30,3},…]` give <20 → 2 days, 20–29.99 → 3, etc.
 */
export const durationDaysPerTeam = (
  kWp: number,
  cfg: MontageConfig
): number => {
  const rule =
    cfg.durationRules.find((r) => r.maxKwp === null || kWp < r.maxKwp) ??
    cfg.durationRules[cfg.durationRules.length - 1];
  return rule.daysPerTeam;
};

/**
 * Calendar span (in working days) for a job. Two teams halve the span
 * (ceil(perTeam / teamCount)) when `twoTeamHalving` is enabled.
 */
export const calendarDays = (
  kWp: number,
  teamCount: number,
  cfg: MontageConfig
): number => {
  const perTeam = durationDaysPerTeam(kWp, cfg);
  const span = cfg.twoTeamHalving
    ? Math.ceil(perTeam / teamCount)
    : perTeam;
  return span + (cfg.bufferDays ?? 0);
};

/**
 * Lead time in weeks. Until Assessment 3's live availability feed exists,
 * "material weight" is derived from the funnel components: heavy items
 * (Speicher / Notstrom / battery) push the job to the longer lead time.
 */
export const leadTimeWeeks = (
  components: string[] = [],
  cfg: MontageConfig
): number =>
  components.some((c) => /speicher|notstrom|battery|akku/i.test(c))
    ? cfg.leadHeavyWeeks
    : cfg.leadBaseWeeks;
