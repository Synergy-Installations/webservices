import { NextRequest } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { isMontageAdmin } from "@com.synergy/frontend-backend-dashboard/montageAuth";

export interface MontageAdmin {
  userId: string;
}

/**
 * Fine-grained authorization gate for the Montagekalender admin API. Mirrors
 * the check in the submits route: reads the Clerk user's `privateMetadata.
 * accessRights` server-side. Returns the admin's userId, or a ready-to-return
 * error Response when the caller is unauthenticated / not an admin.
 */
export async function requireMontageAdmin(
  req: NextRequest
): Promise<{ admin: MontageAdmin } | { error: Response }> {
  const { userId } = getAuth(req);
  if (!userId) {
    return { error: json({ success: false, error: "Unauthorized" }, 401) };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const accessRights = user.privateMetadata?.accessRights as
    | string[]
    | undefined;

  if (!isMontageAdmin(accessRights)) {
    return { error: json({ success: false, error: "Forbidden" }, 403) };
  }

  return { admin: { userId } };
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
