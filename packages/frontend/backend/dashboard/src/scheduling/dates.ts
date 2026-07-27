import { DateTime } from "luxon";
import Holidays from "date-holidays";
import type { MontageConfig } from "./config";

/**
 * All scheduling date math runs in a fixed timezone on "YYYY-MM-DD" date-key
 * strings — never on raw UTC Date objects — to avoid the classic off-by-one
 * where a Vienna day boundary lands on the previous UTC day.
 */
export const TZ = "Europe/Vienna";

// Austrian public holidays are almost entirely federal; the country-level "AT"
// set already covers every work-free day (state only affects Landespatron days,
// which are not general work-free days).
const hd = new Holidays("AT");

export const todayKey = (): string =>
  DateTime.now().setZone(TZ).toISODate()!;

const dt = (key: string): DateTime => DateTime.fromISO(key, { zone: TZ });

export const addDays = (key: string, n: number): string =>
  dt(key).plus({ days: n }).toISODate()!;

const isWeekend = (key: string, cfg: MontageConfig): boolean =>
  !cfg.workingWeekdays.includes(dt(key).weekday);

export const isHoliday = (key: string): boolean => {
  const r = hd.isHoliday(dt(key).toJSDate());
  return Array.isArray(r) && r.some((h) => h.type === "public");
};

export const isWorkingDay = (key: string, cfg: MontageConfig): boolean =>
  !isWeekend(key, cfg) &&
  !isHoliday(key) &&
  !cfg.additionalNonWorkingDays.includes(key);

export const nextWorkingDay = (key: string, cfg: MontageConfig): string => {
  let k = key;
  while (!isWorkingDay(k, cfg)) k = addDays(k, 1);
  return k;
};

/** Collect the next `count` working days on or after `startKey`. */
export const collectWorkingDays = (
  startKey: string,
  count: number,
  cfg: MontageConfig
): string[] => {
  const out: string[] = [];
  let k = nextWorkingDay(startKey, cfg);
  while (out.length < count) {
    if (isWorkingDay(k, cfg)) out.push(k);
    k = addDays(k, 1);
  }
  return out;
};

/**
 * Like `collectWorkingDays`, but only counts working days for which `isFree`
 * returns true — letting a job slot into the gaps around a team's existing
 * bookings (e.g. days 2–3 already taken → the job runs days 1 & 4). The first
 * element is always `startKey` rolled forward to a working day. Look-ahead is
 * bounded (~1000 calendar days); if it cannot gather `count` free days it
 * returns what it found, and the caller treats a short result as "no placement".
 */
export const collectFreeWorkingDays = (
  startKey: string,
  count: number,
  cfg: MontageConfig,
  isFree: (dateKey: string) => boolean
): string[] => {
  const out: string[] = [];
  let k = nextWorkingDay(startKey, cfg);
  let guard = 0;
  while (out.length < count && guard < 1000) {
    if (isWorkingDay(k, cfg) && isFree(k)) out.push(k);
    k = addDays(k, 1);
    guard++;
  }
  return out;
};
