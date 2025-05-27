import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { MessageInterface } from "@com.synergy/frontend-backend-dashboard/message";
import User from "@com.synergy/frontend-backend-dashboard/user";
import Message from "@com.synergy/frontend-backend-dashboard/message";
import Step from "@com.synergy/frontend-backend-dashboard/step";
import Vault, {
  VaultInterface,
} from "@com.synergy/frontend-backend-dashboard/vault";
import { GetVaultsInterface } from "@com.synergy/frontend-backend-dashboard/vault";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: submitId } = params;
  const { searchParams } = new URL(req.url);
  const stepId = searchParams.get("stepId");

  const { userId } = getAuth(req);

  // if (!userId) {
  //   return NextResponse.json(
  //     { success: false, error: "Unauthorized" },
  //     { status: 401 }
  //   );
  // }

  await dbConnect();

  try {
    const dbSubmit = await Submit.findById(
      submitId,
      "emailAddress members visibility"
    ).exec();

    if (
      dbSubmit.visibility === "public" ||
      dbSubmit.members?.some(
        (right: any) =>
          right.userAuthId === userId && right.rights.includes("read")
      )
    ) {
      // Get the vaults for the submitId without a specific step or
      // get the vaults for the specific step
      const vaults = await Vault.find({
        submitId,
        stepId: stepId,
        $or: [
          { visibility: "public" },
          {
            members: {
              $elemMatch: {
                userAuthId: userId,
                rights: { $in: ["read"] },
              },
            },
          },
        ],
      })
        .sort({ order: 1 })
        .exec();

      return NextResponse.json(
        {
          success: true,
          data: { vaults },
        },
        { status: 200 }
      );
    } else if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const accessRights = user.privateMetadata?.accessRights as
        | string[]
        | undefined;

      if (
        accessRights?.includes("all:*") ||
        accessRights?.includes("all:vaults")
      ) {
        // Get the vaults for the submitId without a specific step or
        // get the vaults for the specific step
        const vaults = await Vault.find({ submitId, stepId: stepId })
          .sort({ order: 1 })
          .exec();

        return NextResponse.json(
          {
            success: true,
            data: { vaults },
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Unauthorized or not enough rights" },
      { status: 401 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error },
      {
        status: 400,
      }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Extract the ID from the request parameters
  const { searchParams } = new URL(req.url);
  const stepId = searchParams.get("stepId");

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

  const body: Partial<VaultInterface> = await req.json();
  try {
    const accessRights = user.privateMetadata?.accessRights as
      | string[]
      | undefined;

    // User has all access or message rights
    if (
      accessRights?.includes("all:*") ||
      accessRights?.includes("all:vaults")
    ) {
      const vault = await Vault.create({
        // sentByUserId: dbUser._id,
        ...body,
      });
      return new Response(JSON.stringify({ success: true, data: vault }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // const dbUser = await User.findOne({ createdUserAuthId: userId || user.id });
    const dbSubmit = await Submit.findById(body.submitId);

    // Check if user has created the submit
    if (
      dbSubmit.visibility === "public" ||
      dbSubmit.members
        .find((right: any) => right.userAuthId === userId)
        .rights.includes("write:vaults")
    ) {
      const vault = await Vault.create({
        // sentByUserId: dbUser._id,
        ...body,
      });
      return new Response(JSON.stringify({ success: true, data: vault }), {
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
}
