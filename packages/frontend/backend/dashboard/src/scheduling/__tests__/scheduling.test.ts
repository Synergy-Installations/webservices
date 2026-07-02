import { describe, it, expect } from "vitest";
import { DEFAULT_MONTAGE_CONFIG } from "../config";
import { calendarDays, durationDaysPerTeam, leadTimeWeeks } from "../rules";
import { collectWorkingDays, isWorkingDay, isHoliday } from "../dates";

const cfg = DEFAULT_MONTAGE_CONFIG;

describe("rules", () => {
  it("computes duration per team from kWp thresholds", () => {
    expect(durationDaysPerTeam(10, cfg)).toBe(2); // <= 20 kWp
    expect(durationDaysPerTeam(35, cfg)).toBe(3); // catch-all tier
  });

  it("computes calendar span, halving for two teams", () => {
    expect(calendarDays(35, 1, cfg)).toBe(3);
    expect(calendarDays(35, 2, cfg)).toBe(2);
    expect(calendarDays(10, 2, cfg)).toBe(1);
  });

  it("derives lead time from heavy material components", () => {
    expect(leadTimeWeeks(["Module"], cfg)).toBe(cfg.leadBaseWeeks);
    expect(leadTimeWeeks(["Speicher 10kWh"], cfg)).toBe(cfg.leadHeavyWeeks);
  });
});

describe("dates", () => {
  it("flags Ostermontag 2026 (a movable feast) as a holiday", () => {
    expect(isHoliday("2026-04-06")).toBe(true);
    expect(isWorkingDay("2026-04-06", cfg)).toBe(false);
  });

  it("collects working days across a weekend and a movable holiday", () => {
    // 2026-04-03 Fri, then Sat/Sun + Ostermontag 04-06 are skipped.
    expect(collectWorkingDays("2026-04-03", 3, cfg)).toEqual([
      "2026-04-03",
      "2026-04-07",
      "2026-04-08",
    ]);
  });
});
