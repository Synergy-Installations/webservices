import { dbConnect } from "@com.synergy/frontend-backend-dashboard/mongodb";
import User from "@com.synergy/frontend-backend-dashboard/user";
import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error(
        "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
      );
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error occured -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occured", {
        status: 400,
      });
    }

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;

    await dbConnect();

    if (eventType === "user.created") {
      // Handle user created event
      let user = await User.findOne({ createdUserAuthId: evt.data.id });
      console.log(
        "User created event:",
        user,
        user?.lastName,
        user?.lastName ? true : false
      );

      if (user) {
        console.log("User already exists, updating user...");
        // User already exists (got created using user.update?) which means the verification status of the req user might be outdated
        user = await User.findOneAndUpdate(
          { createdUserAuthId: evt.data.id },
          {
            status:
              user.verifications?.emailAddress === true
                ? "complete"
                : evt.data.email_addresses[0].verification?.status ===
                    "verified"
                  ? "complete"
                  : "incomplete",
            // Empty strings are false and will use the evt.data values
            firstName: user.firstName
              ? user.firstName
              : evt.data.first_name || "",
            lastName: user.lastName ? user.lastName : evt.data.last_name || "",
            emailAddress: user.emailAddress
              ? user.emailAddress
              : evt.data.email_addresses[0]?.email_address,
            phoneNumber: user.phoneNumber
              ? user.phoneNumber
              : evt.data.phone_numbers[0]?.phone_number,
            verifications: {
              emailAddress: user.verifications?.emailAddress
                ? user.verifications?.emailAddress
                : evt.data.email_addresses[0].verification?.status ===
                    "verified" || false,
            },
          },
          { new: true }
        );
      } else {
        console.log("User does not exist, creating new user...");
        user = await User.create({
          status:
            evt.data.email_addresses[0].verification?.status === "verified"
              ? "complete"
              : "incomplete",
          firstName: evt.data.first_name || "",
          lastName: evt.data.last_name || "",
          emailAddress: evt.data.email_addresses[0]?.email_address,
          phoneNumber: evt.data.phone_numbers[0]?.phone_number,
          verifications: {
            emailAddress:
              evt.data.email_addresses[0].verification?.status === "verified" ||
              false,
          },
          createdUserAuthId: evt.data.id,
        });
      }
      if (!user) {
        console.error("User not found");
        return new Response("User not created", { status: 404 });
      }
    } else if (eventType === "user.updated") {
      // Handle user updated event
      const user = await User.findOneAndUpdate(
        { createdUserAuthId: evt.data.id },
        {
          status:
            evt.data.email_addresses[0].verification?.status === "verified"
              ? "complete"
              : "incomplete",
          firstName: evt.data.first_name || "",
          lastName: evt.data.last_name || "",
          emailAddress: evt.data.email_addresses[0]?.email_address,
          phoneNumber: evt.data.phone_numbers[0]?.phone_number,
          verifications: {
            emailAddress:
              evt.data.email_addresses[0].verification?.status === "verified" ||
              false,
          },
          createdUserAuthId: evt.data.id,
        },
        { new: true, upsert: true }
      );
      if (!user) {
        console.error("User not found");
        return new Response("User not found", { status: 404 });
      }
    } else if (eventType === "user.deleted") {
      // Handle user deleted event
      const user = await User.findOneAndDelete({
        createdUserAuthId: evt.data.id,
      });
      if (!user) {
        console.error("User not found");
        return new Response("User not found", { status: 404 });
      }
    } else {
      // Handle other events
      console.log("Unhandled event type:", eventType);
      return new Response("Webhook received - Unhandled event type", {
        status: 400,
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}

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

// export async function POST(req: NextRequest) {
//   await dbConnect();

//   try {
//     const data = await req.json();
//     const user = await User.create(data);
//     return new Response(JSON.stringify({ success: true, data: user }), {
//       status: 201,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ success: false, error: error }), {
//       status: 400,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   }
// }
