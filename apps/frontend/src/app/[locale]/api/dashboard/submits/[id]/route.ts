import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await dbConnect();

  try {
    const submit = await Submit.findById(id);

    // Discriminate rights based on the user
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

    if (
      submit.visibility === "public" ||
      submit.members
        .find((right: any) => right.userAuthId === userId)
        ?.rights?.includes("read")
    ) {
      console.log("public or a member");
      return new Response(JSON.stringify({ success: true, data: submit }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      // Check if user is an admin or has specific access rights
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const accessRights = user.privateMetadata?.accessRights as
        | string[]
        | undefined;

      console.log("accessRights", accessRights);

      if (
        accessRights?.includes("all:*") ||
        accessRights?.includes("all:submits")
      ) {
        return new Response(JSON.stringify({ success: true, data: submit }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
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
    }
  } catch (error) {
    console.error("Error fetching submit:", error);
    return new Response(JSON.stringify({ success: false, error: error }), {
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

    const submitFormElements: any = Object.values(
      body?.data?.submit?.form || {}
    );
    const updateEmailAddress =
      body?.emailAddress ||
      submitFormElements?.find((form: any) => form.uid === "submit-form-email")
        ?.selected?.inputValue;

    // User has all access rights
    if (accessRights?.includes("all:*")) {
      const submit = await Submit.findByIdAndUpdate(
        id,
        {
          ...body,
          ...(updateEmailAddress !== undefined && {
            emailAddress: updateEmailAddress,
          }),
        },
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
        {
          ...body,
          ...(updateEmailAddress !== undefined && {
            emailAddress: updateEmailAddress,
          }),
        },
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
    return NextResponse.json({ success: false, error: error }, { status: 400 });
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
