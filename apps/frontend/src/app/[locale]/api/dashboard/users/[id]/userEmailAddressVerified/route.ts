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
      const user = await User.findOne({ emailAddress: id }).exec();
      return new Response(
        JSON.stringify({
          success: true,
          userId: user == null ? null : user._id,
          userEmailAddressVerified:
            user == null ? false : user.verifications.emailAddress,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else if (searchParams.get("query") === "authId") {
      const user = await User.findOne({ createdUserAuthId: id }).exec();
      return new Response(
        JSON.stringify({
          success: true,
          userId: user == null ? null : user._id,
          userEmailAddressVerified:
            user == null ? false : user.verifications.emailAddress,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      const user = await User.findOne({ _id: id }).exec();
      return new Response(
        JSON.stringify({
          success: true,
          userId: user == null ? null : user._id,
          userEmailAddressVerified:
            user == null ? false : user.verifications.emailAddress,
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
    console.error(error);
    return new Response(JSON.stringify({ success: false }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
