import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { AssetInterface } from "@com.synergy/frontend-backend-dashboard/asset";
import User from "@com.synergy/frontend-backend-dashboard/user";
import Asset from "@com.synergy/frontend-backend-dashboard/asset";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; vaultId: string } }
) {
  const { id: submitId, vaultId } = params;
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  await dbConnect();

  try {
    const accessRights = user.privateMetadata?.accessRights as
      | string[]
      | undefined;

    const dbSubmit = await Submit.findById(submitId, "emailAddress").exec();

    if (
      accessRights?.includes("all:*") ||
      accessRights?.includes("all:assets")
    ) {
      const assets = await Asset.find({
        vaultId,
      })
        .populate("createdByUserId", "firstName lastName emailAddress")
        .sort({ createdAt: 1 })
        .exec();

      return NextResponse.json(
        {
          success: true,
          data: { submit: { emailAddress: dbSubmit.emailAddress }, assets },
        },
        { status: 200 }
      );
    }

    if (
      dbSubmit.visibility === "public" ||
      dbSubmit.members
        .find((right: any) => right.userAuthId === userId)
        .rights.includes("read:vaults")
    ) {
      const assets = await Asset.find({
        vaultId: vaultId,
      })
        .populate("createdByUserId", "firstName lastName emailAddress")
        .sort({ createdAt: 1 })
        .exec();

      return NextResponse.json(
        {
          success: true,
          data: { submit: { emailAddress: dbSubmit.emailAddress }, assets },
        },
        { status: 200 }
      );
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
      const asset = await Asset.create({
        createdByUserId: dbUser._id,
        ...body,
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
      const asset = await Asset.create({
        createdByUserId: dbUser._id,
        ...body,
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
}

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;

//   const { userId } = getAuth(req); // Get the authenticated user's ID from the session

//   if (!userId) {
//     return new Response(
//       JSON.stringify({ success: false, error: "Unauthorized" }),
//       {
//         status: 401,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   }

//   const client = await clerkClient();
//   const user = await client.users.getUser(userId);

//   await dbConnect();

//   try {
//     const body = await req.json();
//     const accessRights = user.privateMetadata?.accessRights as
//       | string[]
//       | undefined;

//     // User has all access rights
//     if (accessRights?.includes("all:*")) {
//       const submit = await Submit.findByIdAndUpdate(
//         id,
//         { ...body },
//         {
//           runValidators: true,
//         }
//       );

//       if (!submit) {
//         return NextResponse.json({ success: false }, { status: 400 });
//       }
//       return NextResponse.json(
//         { success: true, data: submit },
//         { status: 200 }
//       );
//     }
//     // Otherwise, check if the user requesting the update is the same as the one who created the submit
//     else {
//       const submit = await Submit.findOneAndUpdate(
//         { _id: id, emailAddress: user.emailAddresses[0].emailAddress },
//         { ...body },
//         {
//           runValidators: true,
//         }
//       );

//       if (!submit) {
//         return NextResponse.json(
//           { success: false, data: submit },
//           { status: 400 }
//         );
//       }
//       return NextResponse.json(
//         { success: true, data: submit },
//         { status: 200 }
//       );
//     }
//   } catch (error) {
//     return NextResponse.json({ success: false }, { status: 400 });
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
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
// }
