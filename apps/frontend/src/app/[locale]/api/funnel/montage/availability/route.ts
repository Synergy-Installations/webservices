import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import {
  findAvailableStartDates,
  earliestStart,
} from "@com.synergy/frontend-backend-dashboard/montageAvailability";
import {
  leadTimeWeeks,
  durationDaysPerTeam,
  calendarDays,
} from "@com.synergy/frontend-backend-dashboard/montageRules";
import { getConfig } from "@com.synergy/frontend-backend-dashboard/montageConfig";

/** Items that push a job onto the longer lead time (mirrors rules.ts). */
const HEAVY_RE = /speicher|notstrom|battery|akku/i;

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Public (unauthenticated) availability for the funnel picker. The customer is
 * querying with their own inputs; the authoritative booking re-derives kWp /
 * components from the saved Submit at confirm time, so client values here are
 * only advisory. Uses teamCount=1 (the conservative customer rule).
 */
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const kWp = Number(searchParams.get("kWp")) || 0;
  const componentsRaw = searchParams.get("components") ?? "";
  const components = componentsRaw
    ? componentsRaw.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  const cfg = await getConfig();
  const slots = await findAvailableStartDates({ kWp, components, teamCount: 1 });

  const heavyComponents = components.filter((c) => HEAVY_RE.test(c));

  return json({
    success: true,
    data: {
      slots,
      earliestStart: earliestStart(components, cfg),
      leadTimeWeeks: leadTimeWeeks(components, cfg),
      // Transparency: exactly how the span and lead time were derived, so the
      // picker can explain the Regelwerk to the customer.
      explain: {
        kWp,
        durationDays: calendarDays(kWp, 1, cfg),
        durationPerTeam: durationDaysPerTeam(kWp, cfg),
        durationRules: cfg.durationRules,
        bufferDays: cfg.bufferDays ?? 0,
        leadBaseWeeks: cfg.leadBaseWeeks,
        leadHeavyWeeks: cfg.leadHeavyWeeks,
        heavyComponents,
      },
    },
  });
}
