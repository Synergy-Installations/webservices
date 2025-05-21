import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { AssetInterface } from "@com.synergy/frontend-backend-dashboard/asset";
import User from "@com.synergy/frontend-backend-dashboard/user";
import Asset from "@com.synergy/frontend-backend-dashboard/asset";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; vaultId: string; assetId: string } }
) {
  const { id, vaultId, assetId } = params; // Extract the ID from the request parameters
  const { userId } = getAuth(req); // Get the authenticated user's ID from the session

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  await dbConnect();

  const body: Partial<AssetInterface> = await req.json();
  try {
    const accessRights = user.privateMetadata?.accessRights as
      | string[]
      | undefined;

    const dbUser = await User.findOne({ createdUserAuthId: userId || user.id });

    // User has all access or asset rights
    if (
      accessRights?.includes("all:*") ||
      accessRights?.includes("all:assets")
    ) {
      const asset = await Asset.deleteOne({
        _id: assetId,
      });
      return new Response(JSON.stringify({ success: true, data: asset }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const dbSubmit = await Submit.findById(body.submitId);

    // Check if user has created the submit
    if (
      dbSubmit.visibility === "public" ||
      dbSubmit.members
        .find((right: any) => right.userAuthId === userId)
        .rights.includes("write:vaults")
    ) {
      const asset = await Asset.deleteOne({
        _id: assetId,
      });
      return new Response(JSON.stringify({ success: true, data: asset }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized or not enough rights",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, data: error }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  //   const { id } = params;

  //   await dbConnect();

  //   try {
  //     const deletedItem = await Submit.deleteOne({ _id: id });

  //     if (!deletedItem) {
  //       return NextResponse.json({ success: false }, { status: 400 });
  //     }

  //     return NextResponse.json({ success: true, data: {} }, { status: 200 });
  //   } catch (error) {
  //     return NextResponse.json({ success: false }, { status: 400 });
  //   }
}
