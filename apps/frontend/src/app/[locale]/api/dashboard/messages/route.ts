import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Item from "@com.synergy/frontend-backend-dashboard/item";
import { NextRequest } from "next/server";
import Message from "@com.synergy/frontend-backend-dashboard/message";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server"; // Ensure you have this package installed
import { MessageInterface } from "@com.synergy/frontend-backend-dashboard/message";
import User from "@com.synergy/frontend-backend-dashboard/user";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { Types } from "mongoose";

// export async function GET(req: NextRequest) {
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
//     const accessRights = user.privateMetadata?.accessRights as string[] | undefined;
//     if (accessRights?.includes("all*")) {
//       const items = await Submit.find({});
//       return new Response(JSON.stringify({ success: true, data: items }), {
//         status: 200,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     } else {
//       const emailAddresses = user.emailAddresses.map(
//         (email) => email.emailAddress
//       );
//       const items = await Submit.find({
//         emailAddress: { $in: emailAddresses },
//       });
//       return new Response(JSON.stringify({ success: true, data: items }), {
//         status: 200,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return new Response(JSON.stringify({ success: false }), {
//       status: 400,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   }
// }

export async function POST(req: NextRequest) {
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

  const body: Partial<MessageInterface> = await req.json();
  try {
    const accessRights = user.privateMetadata?.accessRights as
      | string[]
      | undefined;

    const dbUser = await User.findOne({ createdUserAuthId: userId || user.id });

    // User has all access or message rights
    if (
      accessRights?.includes("all*") ||
      accessRights?.includes("all:messages")
    ) {
      const message = await Message.create({
        sentByUserId: dbUser._id,
        ...body,
      });
      return new Response(JSON.stringify({ success: true, data: message }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const dbSubmit = await Submit.findById(body.submitId);

    // Check if user has created the submit
    if (dbUser.emailAddress === dbSubmit.emailAddress) {
      const message = await Message.create({
        sentByUserId: dbUser._id,
        ...body,
      });
      return new Response(JSON.stringify({ success: true, data: message }), {
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
