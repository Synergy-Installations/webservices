import { NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import Item from "@com.synergy/frontend-backend-dashboard/item";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await dbConnect();

  try {
    const items = await Item.find({ _id: id });
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
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await dbConnect();

  try {
    const body = await req.json();
    const item = await Item.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: item }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await dbConnect();

  try {
    const deletedItem = await Item.deleteOne({ _id: id });

    if (!deletedItem) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
