import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import Image from "next/image";
import Logo from "../../../shared/images/synergy-logo-grid.svg";
import { SmallLogo } from "@com.synergy/frontend-ui/SmallLogo";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import { useMessages, useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface DefaultFooterProps {
  border?: boolean;
}

export const DefaultFooter = (props: DefaultFooterProps) => {
  const { border = false } = props;

  const t = useTranslations("LandingPage.Shared.Footer");

  const messages: any = useMessages();
  const parterKeys = Object.keys(messages.LandingPage.Shared.Footer.boxes);
  const socialKeys = Object.keys(messages.LandingPage.Shared.Footer.socials);

  const getBoxItems = (key: string): string[] => {
    return (
      Object.keys(messages.LandingPage.Shared.Footer.boxes[key].links) || []
    );
  };

  return (
    <footer>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-20">
        {/* Top area: Blocks */}
        <div
          className={`grid gap-10 py-8 sm:grid-cols-12 md:py-12 ${border ? "border-t [border-image:linear-gradient(to_right,transparent,theme(colors.slate.200),transparent)1]" : ""}`}
        >
          {/* 1st block */}
          <div className="space-y-2 sm:col-span-12 lg:col-span-4">
            <div>
              <Link href="/">
                <Image
                  loader={ImageLoader}
                  src={t("logo.src")}
                  width={Number(t("logo.width"))}
                  height={Number(t("logo.height"))}
                  alt={t("logo.alt")}
                />
              </Link>
            </div>
            <div className="text-sm text-synergy-dark-grey">
              {t("disclamer")}
            </div>
          </div>

          {/* 2nd block */}
          {parterKeys.map((partnerKey, index) => (
            <div
              key={index}
              className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2"
            >
              <h3 className="text-sm font-medium">
                {t(`boxes.${partnerKey}.title`)}
              </h3>
              <ul className="space-y-2 text-sm">
                {getBoxItems(partnerKey).map((item, index) => (
                  <li key={index}>
                    <Link
                      className="text-synergy-dark-grey transition hover:text-gray-900"
                      href={t(`boxes.${partnerKey}.links.${item}.href`)}
                    >
                      {t(`boxes.${partnerKey}.links.${item}.text`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 5th block */}
          <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-medium">Social</h3>
            <ul className="flex gap-1 items-center">
              {socialKeys.map((socialKey, index) => (
                <li key={index}>
                  <Link
                    className="flex items-center justify-center text-synergy-light-blue transition hover:text-blue-600"
                    href={t(`socials.${socialKey}.href`)}
                    aria-label={t(`socials.${socialKey}.icon.alt`)}
                    target="_blank"
                  >
                    <Image
                      className="shrink-0 fill-synergy-light-blue opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      loader={ImageLoader}
                      width={Number(t(`socials.${socialKey}.icon.width`))}
                      height={Number(t(`socials.${socialKey}.icon.height`))}
                      src={t(`socials.${socialKey}.icon.src`)}
                      alt={t(`socials.${socialKey}.icon.alt`)}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Big text */}
      <div className="relative -mt-16 h-60 w-full z-0" aria-hidden="true">
        <div className="pointer-events-none absolute left-1/2 -z-10 -translate-x-1/2 text-center text-[348px] font-bold leading-none before:bg-gradient-to-b before:from-gray-200 before:to-gray-100/30 before:to-80% before:bg-clip-text before:text-transparent before:content-['Synergie'] after:absolute after:inset-0 after:bg-gray-300/70 after:bg-clip-text after:text-transparent after:mix-blend-darken after:content-['Synergie'] after:[text-shadow:0_1px_0_white]"></div>
        {/* Glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2/3"
          aria-hidden="true"
        >
          <div className="h-56 w-56 rounded-full border-[20px] border-blue-700 blur-[80px] will-change-[filter]"></div>
        </div>
      </div>
    </footer>
  );
};

export default DefaultFooter;
