import createMiddleware from "next-intl/middleware";
import { routing } from "@com.synergy/frontend-shared-internationalization/routing";
import locales from "@com.synergy/frontend-shared-internationalization/variables";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Matches localized dashboard *pages* (e.g. `/at-AT/dashboard/...`) so they can
// be protected by Clerk. The `(?!api\/)` lookahead prevents this from also
// matching the `/api/dashboard/...` route handlers, which manage their own auth
// (some, like the public funnel submit, are intentionally unauthenticated).
const isDashboardRoute = (pathname: string) =>
  /^\/(?!api\/)[^/]+\/dashboard/.test(pathname);

const hasLocalePrefix = (pathname: string) =>
  locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

// Our German locale uses the non-standard slug `at-AT` (language subtag `at`),
// not the BCP-47 German tag `de`. next-intl resolves the locale by matching the
// `Accept-Language` header against our locales *by language subtag*, so a German
// preference (`de`) never matches `at-AT`. Browsers like Firefox send German with
// an English fallback (e.g. `de,en-US;q=0.7,en;q=0.3`); the matcher skips the
// unmatched German entry and lands on `en`, sending German visitors to the English
// site. (Chrome's German build omits the English fallback, so it instead falls
// through to our default locale and happens to work.) Rewrite German primary
// subtags to `at-AT` so they match our locale, while preserving the browser's
// preference order so users who genuinely prefer English still get `en`.
const mapGermanToLocale = (acceptLanguage: string) =>
  acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag, ...params] = entry.split(";");
      const isGerman = tag.trim().split("-")[0].toLowerCase() === "de";
      return [isGerman ? "at-AT" : tag.trim(), ...params].join(";");
    })
    .join(",");

const withNormalizedLocale = (req: NextRequest): NextRequest => {
  const acceptLanguage = req.headers.get("accept-language");
  if (!acceptLanguage) return req;

  const normalized = mapGermanToLocale(acceptLanguage);
  if (normalized === acceptLanguage) return req;

  const headers = new Headers(req.headers);
  headers.set("accept-language", normalized);
  return new NextRequest(req, { headers });
};

export default clerkMiddleware(
  async (auth, req) => {
    if (isDashboardRoute(req.nextUrl.pathname)) await auth.protect();

    // Only the locale-less initial navigation triggers `Accept-Language`-based
    // detection, so we only normalize the header there (avoids cloning requests
    // that already carry a locale prefix, e.g. API routes with bodies).
    const request = hasLocalePrefix(req.nextUrl.pathname)
      ? req
      : withNormalizedLocale(req);

    return intlMiddleware(request);
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
