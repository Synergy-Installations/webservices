import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import locales from "@com.synergy/frontend-shared-internationalization/variables";
import { defaultLocale } from "@com.synergy/frontend-shared-internationalization/variables";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  // Currently does not work and gives a TypeError
  pathnames: {
    // If all locales use the same pathname, a single
    // external path can be used for all locales
    // "/": "/",
    // "/blog": "/blog",
    // If some locales use different paths, you can
    // specify the relevant external pathnames
    // "/contact-us": {
    //   "de-AT": "/kontakt",
    // },
    // Dynamic params are supported via square brackets
    // "/news/[articleSlug]": {
    //   de: "/neuigkeiten/[articleSlug]",
    // },
    // Static pathnames that overlap with dynamic segments
    // will be prioritized over the dynamic segment
    // "/news/just-in": {
    //   de: "/neuigkeiten/aktuell",
    // },
    // Also (optional) catch-all segments are supported
    // "/categories/[...slug]": {
    //   de: "/kategorien/[...slug]",
    // },
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
