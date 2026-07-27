import Team from "../db/models/team";
import TeamDayOccupancy from "../db/models/teamDayOccupancy";
import { getConfig, MontageConfig } from "./config";
import { calendarDays, leadTimeWeeks } from "./rules";
import {
  addDays,
  collectWorkingDays,
  isWorkingDay,
  nextWorkingDay,
  todayKey,
} from "./dates";

export interface AvailableSlot {
  startDate: string;
  endDate: string;
  workingDays: string[];
}

export interface AvailabilityInput {
  kWp: number;
  components?: string[];
  teamCount?: number;
}

/** Earliest bookable start = today + lead time, rolled to the next working day. */
export function earliestStart(
  components: string[],
  cfg: MontageConfig
): string {
  return addDays(todayKey(), leadTimeWeeks(components, cfg) * 7);
}

/**
 * Read-only scan of buildable start days over the configured horizon. For each
 * candidate working-day start, collect the working days the job needs and
 * return it when at least `teamCount` active teams are free for all of them.
 * Correctness is enforced at write time (the unique index); this is advisory.
 */
export async function findAvailableStartDates({
  kWp,
  components = [],
  teamCount = 1,
}: AvailabilityInput): Promise<AvailableSlot[]> {
  const cfg = await getConfig();
  const span = calendarDays(kWp, teamCount, cfg);
  const teams = await Team.find({ active: true }).lean();
  if (teams.length < teamCount) return [];

  const out: AvailableSlot[] = [];
  const limit = addDays(todayKey(), cfg.horizonDays);
  const startFrom = nextWorkingDay(earliestStart(components, cfg), cfg);

  // Load all occupancy in the scan window in ONE query. Previously this ran a
  // `find` per candidate day (~85 sequential Atlas round-trips over the horizon),
  // which timed out on serverless (504). The upper bound is padded so a job that
  // starts near `limit` and extends past it still sees any trailing occupancy.
  const occ = await TeamDayOccupancy.find({
    dateKey: { $gte: startFrom, $lte: addDays(limit, span * 3 + 7) },
  })
    .select({ teamId: 1, dateKey: 1 })
    .lean();
  const busy = new Set(occ.map((o: any) => `${o.teamId}|${o.dateKey}`));

  let start = startFrom;
  while (start <= limit) {
    if (isWorkingDay(start, cfg)) {
      const need = collectWorkingDays(start, span, cfg);
      const free = teams.filter((t: any) =>
        need.every((d) => !busy.has(`${t._id}|${d}`))
      );
      if (free.length >= teamCount) {
        out.push({
          startDate: start,
          endDate: need[need.length - 1],
          workingDays: need,
        });
      }
    }
    start = addDays(start, 1);
  }
  return out;
}
