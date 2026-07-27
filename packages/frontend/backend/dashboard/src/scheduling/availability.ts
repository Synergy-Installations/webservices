import Team from "../db/models/team";
import TeamDayOccupancy from "../db/models/teamDayOccupancy";
import { getConfig, MontageConfig } from "./config";
import { calendarDays, leadTimeWeeks } from "./rules";
import {
  addDays,
  collectFreeWorkingDays,
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

export interface TeamPlacement {
  teamId: string;
  workingDays: string[];
  endDate: string;
}

/**
 * The gap-aware placement each active team could take for a job starting on
 * `start`: the `span` free working days on/after `start` for that team, skipping
 * days it is already busy (so a job fills the gaps around existing bookings). A
 * team qualifies only if it is free on the start day itself — so every offered
 * start is a real Montagebeginn — and can gather all `span` days. Results are
 * ordered tightest-packing-first (earliest end, then teamId) so the availability
 * scan and the booking write agree on which teams to prefer.
 *
 * `busy` is a Set of "teamId|dateKey"; both this scan and `createHold` build it
 * the same way, and the unique `{teamId,dateKey}` index is the final guard at
 * write time regardless of what this advisory scan reported.
 */
export function placementsForStart(
  start: string,
  span: number,
  teams: { _id: unknown }[],
  busy: Set<string>,
  cfg: MontageConfig
): TeamPlacement[] {
  const s0 = nextWorkingDay(start, cfg);
  const out: TeamPlacement[] = [];
  for (const t of teams) {
    const id = String((t as { _id: unknown })._id);
    if (busy.has(`${id}|${s0}`)) continue; // busy on the start day itself
    const days = collectFreeWorkingDays(
      s0,
      span,
      cfg,
      (d) => !busy.has(`${id}|${d}`)
    );
    if (days.length === span) {
      out.push({ teamId: id, workingDays: days, endDate: days[days.length - 1] });
    }
  }
  out.sort((a, b) =>
    a.endDate === b.endDate
      ? a.teamId.localeCompare(b.teamId)
      : a.endDate < b.endDate
        ? -1
        : 1
  );
  return out;
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
      // Gap-aware: each team fills the next `span` free working days from `start`,
      // skipping days it is already busy. A start is offered when at least
      // `teamCount` teams can host it; the shown span uses the tightest-packing
      // teams so the customer sees the actual work days (day 1 & day 4, not 1–4).
      const placements = placementsForStart(start, span, teams, busy, cfg);
      if (placements.length >= teamCount) {
        const chosen = placements.slice(0, teamCount);
        const union = Array.from(
          new Set(chosen.flatMap((p) => p.workingDays))
        ).sort();
        out.push({
          startDate: start,
          endDate: union[union.length - 1],
          workingDays: union,
        });
      }
    }
    start = addDays(start, 1);
  }
  return out;
}
