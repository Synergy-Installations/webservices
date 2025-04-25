import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { MessageInterface } from "@com.synergy/frontend-backend-dashboard/message";
import User from "@com.synergy/frontend-backend-dashboard/user";
import Message from "@com.synergy/frontend-backend-dashboard/message";
import Step from "@com.synergy/frontend-backend-dashboard/step";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  const { id: submitId, stepId } = params;
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

    if (
      accessRights?.includes("all:*") ||
      accessRights?.includes("all:steps")
    ) {
      const step = await Step.findOne({
        _id: stepId,
        submitId: submitId,
      }).exec();

      return NextResponse.json(
        {
          success: true,
          data: { step },
        },
        { status: 200 }
      );
    }

    const dbSubmit = await Submit.findById(submitId, "emailAddress").exec();

    if (
      user.emailAddresses.some((e) => e.emailAddress === dbSubmit.emailAddress)
    ) {
      const step = await Step.findOne({
        _id: stepId,
        submitId: submitId,
      }).exec();

      return NextResponse.json(
        {
          success: true,
          data: { step },
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

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params; // Extract the ID from the request parameters
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

//   const body: Partial<MessageInterface> = await req.json();
//   try {
//     const accessRights = user.privateMetadata?.accessRights as
//       | string[]
//       | undefined;

//     // User has all access or message rights
//     if (
//       accessRights?.includes("all:*") ||
//       accessRights?.includes("all:messages")
//     ) {
//       const step = await Step.create({
//         // sentByUserId: dbUser._id,
//         ...body,
//       });
//       return new Response(JSON.stringify({ success: true, data: step }), {
//         status: 201,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     }

//     const dbUser = await User.findOne({ createdUserAuthId: userId || user.id });
//     const dbSubmit = await Submit.findById(body.submitId);

//     // Check if user has created the submit
//     if (dbUser.emailAddress === dbSubmit.emailAddress) {
//       const step = await Step.create({
//         // sentByUserId: dbUser._id,
//         ...body,
//       });
//       return new Response(JSON.stringify({ success: true, data: step }), {
//         status: 201,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     }

//     return new Response(
//       JSON.stringify({
//         success: false,
//         error: "Unauthorized or not enough rights",
//       }),
//       {
//         status: 401,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     return new Response(JSON.stringify({ success: false, data: error }), {
//       status: 400,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   }
// }

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  const { id: submitId, stepId } = params;

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

  try {
    const body = await req.json();
    const accessRights = user.privateMetadata?.accessRights as
      | string[]
      | undefined;

    // User has all access rights
    if (
      accessRights?.includes("all:*") ||
      accessRights?.includes("all:steps")
    ) {
      const step = await Step.findByIdAndUpdate(
        stepId,
        { ...body },
        {
          runValidators: true,
        }
      );

      if (!step) {
        return NextResponse.json({ success: false }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: step }, { status: 200 });
    }

    const dbSubmit = await Submit.findById(submitId, "emailAddress").exec();

    // Otherwise, check if the user requesting the update is the same as the one who created the submit
    if (
      user.emailAddresses.some((e) => e.emailAddress === dbSubmit.emailAddress)
    ) {
      const step = await Step.findByIdAndUpdate(
        stepId,
        { ...body },
        {
          runValidators: true,
        }
      );

      if (!step) {
        return NextResponse.json({ success: false }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: step }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

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
