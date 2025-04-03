import { NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import User from "@com.synergy/frontend-backend-dashboard/user";

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
      const items = await User.find({ emailAddress: id });
      return new Response(JSON.stringify({ success: true, data: items }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else if (searchParams.get("query") === "authId") {
      const items = await User.find({ createdUserAuthId: id });
      return new Response(JSON.stringify({ success: true, data: items }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const items = await User.find({ _id: id });
      return new Response(JSON.stringify({ success: true, data: items }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await dbConnect();

  try {
    const body = await req.json();
    const user = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
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
//     const deletedItem = await User.deleteOne({ _id: id });

//     if (!deletedItem) {
//       return NextResponse.json({ success: false }, { status: 400 });
//     }

//     return NextResponse.json({ success: true, data: {} }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ success: false }, { status: 400 });
//   }
// }
