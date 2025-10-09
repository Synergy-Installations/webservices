import createMiddleware from "next-intl/middleware";
import { routing } from "@com.synergy/frontend-shared-internationalization/routing";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/:locale([a-z]{2}-[A-Z]{2})/dashboard",
]);

export default clerkMiddleware(
  async (auth, req) => {
    console.log(isProtectedRoute(req));
    if (isProtectedRoute(req)) await auth.protect();

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
