import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Item from "@com.synergy/frontend-backend-dashboard/item";
import { NextRequest } from "next/server";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server"; // Ensure you have this package installed

export async function GET(req: NextRequest) {
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
    const accessRights = user.privateMetadata?.accessRights as
      | string[]
      | undefined;
    if (accessRights?.includes("all:*")) {
      const items = await Submit.find({});
      return new Response(JSON.stringify({ success: true, data: items }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const emailAddresses = user.emailAddresses.map(
        (email) => email.emailAddress
      );
      const items = await Submit.find({
        emailAddress: { $in: emailAddresses },
      });
      return new Response(JSON.stringify({ success: true, data: items }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const data = await req.json();
    const item = await Submit.create(data);
    return new Response(JSON.stringify({ success: true, data: item }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
