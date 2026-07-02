import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Team from "@com.synergy/frontend-backend-dashboard/team";
import { requireMontageAdmin, json } from "../_auth";

export async function GET(req: NextRequest) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  const teams = await Team.find({}).sort({ name: 1 }).lean();
  return json({ success: true, data: teams });
}

export async function POST(req: NextRequest) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  try {
    const body = await req.json();
    const team = await Team.create({
      name: body.name,
      color: body.color,
      active: body.active ?? true,
    });
    return json({ success: true, data: team }, 201);
  } catch (error) {
    return json({ success: false, error: String(error) }, 400);
  }
}
