import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import Item from "@com.synergy/frontend-backend-dashboard/item";
import { NextRequest } from "next/server";
import Submit from "@com.synergy/frontend-backend-dashboard/submit";

// export async function GET(req: NextRequest) {
//   await dbConnect();

//   try {
//     const items = await Item.find({});
//     return new Response(JSON.stringify({ success: true, data: items }), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ success: false }), {
//       status: 400,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   }
// }

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
