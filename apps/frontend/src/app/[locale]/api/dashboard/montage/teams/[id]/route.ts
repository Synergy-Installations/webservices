import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Team from "@com.synergy/frontend-backend-dashboard/team";
import { requireMontageAdmin, json } from "../../_auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  try {
    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.color !== undefined) update.color = body.color;
    if (body.active !== undefined) update.active = body.active;

    const team = await Team.findByIdAndUpdate(params.id, update, {
      new: true,
    }).lean();
    if (!team) return json({ success: false, error: "Not found" }, 404);
    return json({ success: true, data: team });
  } catch (error) {
    return json({ success: false, error: String(error) }, 400);
  }
}
