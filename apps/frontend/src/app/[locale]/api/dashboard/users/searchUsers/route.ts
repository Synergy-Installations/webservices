import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import { NextRequest } from "next/server";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server"; // Ensure you have this package installed
import User from "@com.synergy/frontend-backend-dashboard/user";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req); // Get the authenticated user's ID from the session

  const { searchParams } = new URL(req.url);
  const searchValue = searchParams.get("searchValue");

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
    // Uncomment to restrict access only to admins
    // const accessRights = user.privateMetadata?.accessRights as
    //   | string[]
    //   | undefined;
    // if (
    //   accessRights?.includes("all:*") ||
    //   accessRights?.includes("all:submits")
    // ) {
    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safeSearchValue = searchValue ? escapeRegex(searchValue) : "";

    const users = await User.find({
      $or: [
        { firstName: { $regex: safeSearchValue, $options: "i" } },
        { lastName: { $regex: safeSearchValue, $options: "i" } },
        { emailAddress: { $regex: safeSearchValue, $options: "i" } },
      ],
    });

    return new Response(JSON.stringify({ success: true, data: users }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
    // } else {
    //   return new Response(
    //     JSON.stringify({ success: false, error: "Unauthorized" }),
    //     {
    //       status: 401,
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    // }
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
