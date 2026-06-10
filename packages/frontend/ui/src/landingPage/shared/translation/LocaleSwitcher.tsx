import { useLocale, useTranslations } from "next-intl";
import { routing } from "@com.synergy/frontend-shared-internationalization/routing";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const localeLabels: Record<string, string> = {
  "at-AT": "DE",
  en: "EN",
};

/* eslint-disable-next-line */
export interface LocaleSwitcherProps {}

export const LocaleSwitcher = (props: LocaleSwitcherProps) => {
  const t = useTranslations("LandingPage.Shared.LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // With only two locales the whole control acts as a toggle, so taps
  // don't need to hit the exact label on small screens
  const otherLocale =
    routing.locales.find((cur) => cur !== locale) ?? locale;

  function onToggle() {
    if (otherLocale === locale) return;
    // Create the new path by replacing the current locale with the new one
    const newPath = pathname.replace(
      /^\/[a-z]{2}(-[A-Z]{2})?/,
      `/${otherLocale}`
    );
    startTransition(() => {
      router.replace(newPath);
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      aria-label={t("label")}
      className={`inline-flex items-center rounded-[10px] bg-gray-100/80 p-0.5 ring-1 ring-gray-200/70 transition-opacity ${
        isPending ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {routing.locales.map((cur) => (
        <span
          key={cur}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide transition-all duration-200 ${
            cur === locale
              ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/[0.04]"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          {localeLabels[cur] ?? cur.slice(0, 2).toUpperCase()}
        </span>
      ))}
    </button>
  );
};

export default LocaleSwitcher;
