/**
 * Montagekalender authorization. This build ships the admin core only: access
 * is granted to office/admin users. Roles reuse the existing Clerk
 * `accessRights` metadata pattern (e.g. "all:*", "submit:*") rather than a new
 * auth system — a user with "all:*" or "montage:*" is a Montage admin.
 */
export const MONTAGE_ADMIN_RIGHTS = ["all:*", "montage:*"];

export function isMontageAdmin(
  accessRights: string[] | undefined | null
): boolean {
  if (!Array.isArray(accessRights)) return false;
  return accessRights.some((right) => MONTAGE_ADMIN_RIGHTS.includes(right));
}
