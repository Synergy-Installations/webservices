import { NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import User from "@com.synergy/frontend-backend-dashboard/user";
import { useStore } from "react-redux";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  console.log("searchParams", id, searchParams);

  await dbConnect();

  try {
    if (searchParams.get("query") === "emailAddress") {
      const userExists = await User.exists({ emailAddress: id });
      return new Response(
        JSON.stringify({
          success: true,
          userExists: userExists !== null,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else if (searchParams.get("query") === "authId") {
      const userExists = await User.exists({ createdUserAuthId: id });
      return new Response(
        JSON.stringify({
          success: true,
          userExists: userExists !== null,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      const userExists = await User.exists({ _id: id });
      return new Response(
        JSON.stringify({
          success: true,
          userExists: userExists !== null,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
