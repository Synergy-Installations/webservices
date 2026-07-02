import { NextRequest } from "next/server";
import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import { deleteBlock } from "@com.synergy/frontend-backend-dashboard/montageBooking";
import { requireMontageAdmin, json } from "../../_auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireMontageAdmin(req);
  if ("error" in gate) return gate.error;
  await dbConnect();

  try {
    await deleteBlock(params.id);
    return json({ success: true });
  } catch (error: any) {
    return json({ success: false, error: String(error?.message ?? error) }, 400);
  }
}
