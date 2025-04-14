import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await dbConnect();

  try {
    const items = await Submit.find({ _id: id });
    return new Response(JSON.stringify({ success: true, data: items }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

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
    if (accessRights?.includes("all*")) {
      const submit = await Submit.findByIdAndUpdate(
        id,
        { ...body },
        {
          runValidators: true,
        }
      );

      if (!submit) {
        return NextResponse.json({ success: false }, { status: 400 });
      }
      return NextResponse.json(
        { success: true, data: submit },
        { status: 200 }
      );
    }
    // Otherwise, check if the user requesting the update is the same as the one who created the submit
    else {
      const submit = await Submit.findOneAndUpdate(
        { _id: id, emailAddress: user.emailAddresses[0].emailAddress },
        { ...body },
        {
          runValidators: true,
        }
      );

      if (!submit) {
        return NextResponse.json(
          { success: false, data: submit },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: true, data: submit },
        { status: 200 }
      );
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
