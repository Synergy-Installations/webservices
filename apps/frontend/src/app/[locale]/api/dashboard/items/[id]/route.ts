import { NextResponse } from "next/server";
import dbConnect from "@com.synergy/frontend-backend-dashboard/mongodb";
import Item from "@com.synergy/frontend-backend-dashboard/item";

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
