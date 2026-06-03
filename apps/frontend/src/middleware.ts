import createMiddleware from "next-intl/middleware";
import { routing } from "@com.synergy/frontend-shared-internationalization/routing";
import { clerkMiddleware } from "@clerk/nextjs/server";

const intlMiddleware = createMiddleware(routing);

// Matches localized dashboard *pages* (e.g. `/at-AT/dashboard/...`) so they can
// be protected by Clerk. The `(?!api\/)` lookahead prevents this from also
// matching the `/api/dashboard/...` route handlers, which manage their own auth
// (some, like the public funnel submit, are intentionally unauthenticated).
const isDashboardRoute = (pathname: string) =>
  /^\/(?!api\/)[^/]+\/dashboard/.test(pathname);

export default clerkMiddleware(
  async (auth, req) => {
    if (isDashboardRoute(req.nextUrl.pathname)) await auth.protect();

    return intlMiddleware(req);
  },
  { debug: false }
);

export const config = {
  matcher: [
    // Exclude sitemap.xml from middleware to prevent locale redirect
    "/((?!_next|sitemap\\.xml|robots\\.txt|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
