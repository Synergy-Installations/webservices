import { describe, it, expect } from "vitest";
import { DEFAULT_MONTAGE_CONFIG } from "../config";
import { calendarDays, durationDaysPerTeam, leadTimeWeeks } from "../rules";
import { collectWorkingDays, isWorkingDay, isHoliday } from "../dates";
import { extractSubmitFields } from "../submitFields";

const cfg = DEFAULT_MONTAGE_CONFIG;

describe("rules", () => {
  it("computes duration per team from kWp thresholds ('ab X' = inclusive lower)", () => {
    expect(durationDaysPerTeam(4.25, cfg)).toBe(2); // unter 20 kWp
    expect(durationDaysPerTeam(19.99, cfg)).toBe(2);
    expect(durationDaysPerTeam(20, cfg)).toBe(3); // ab 20 kWp
    expect(durationDaysPerTeam(30, cfg)).toBe(4); // ab 30 kWp
    expect(durationDaysPerTeam(50, cfg)).toBe(5); // ab 50 kWp
    expect(durationDaysPerTeam(75, cfg)).toBe(7); // ab 75 kWp
    expect(durationDaysPerTeam(100, cfg)).toBe(10); // ab 100 kWp
    expect(durationDaysPerTeam(250, cfg)).toBe(10);
  });

  it("computes calendar span, halving for two teams", () => {
    expect(calendarDays(35, 1, cfg)).toBe(4); // ab 30 kWp → 4 days
    expect(calendarDays(35, 2, cfg)).toBe(2); // halved (ceil 4/2)
    expect(calendarDays(10, 2, cfg)).toBe(1); // 2 days halved
  });

  it("derives lead time from heavy material components", () => {
    expect(leadTimeWeeks(["Module"], cfg)).toBe(cfg.leadBaseWeeks);
    expect(leadTimeWeeks(["Speicher 10kWh"], cfg)).toBe(cfg.leadHeavyWeeks);
  });
});

describe("submitFields kWp parsing", () => {
  const mkSubmit = (selected: Record<string, unknown>) => ({
    data: {
      q1: {
        form: {
          f1: { uid: "interested-products-range-2", selected },
        },
      },
    },
  });

  it("reads the actual kWp from selectedValue, not the slider rangeValue", () => {
    // rangeValue is the exp slider-thumb projection — must be ignored.
    const submit = mkSubmit({ selectedValue: "4,25", rangeValue: 1571.815 });
    expect(extractSubmitFields(submit).kWp).toBe(4.25);
  });

  it("parses de-AT and en formatted numbers", () => {
    expect(extractSubmitFields(mkSubmit({ selectedValue: "1.234,5" })).kWp).toBe(
      1234.5
    );
    expect(extractSubmitFields(mkSubmit({ selectedValue: "1,234.5" })).kWp).toBe(
      1234.5
    );
    expect(extractSubmitFields(mkSubmit({ selectedValue: 42 })).kWp).toBe(42);
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
