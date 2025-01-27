import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import Image from "next/image";
import Logo from "../../../shared/images/synergy-logo-grid.svg";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import { useMessages, useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface CtaLooseProps {}

export const CtaLoose = (props: CtaLooseProps) => {
  const t = useTranslations("LandingPage.Home.CtaLoose");

  const messages: any = useMessages();
  const parterKeys = Object.keys(messages.LandingPage.Home.CtaLoose.partners);

  return (
    <section>
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-md mb-8 relative before:absolute before:-top-12 before:w-52 before:h-52 before:bg-synergy-dark-grey before:opacity-[.08] before:rounded-full before:blur-3xl before:-z-10">
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
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-synergy-dark-grey mb-4">
              {t.rich("title", {
                underscore: (chunks) => (
                  <em className="relative not-italic inline-flex justify-center items-end">
                    <span className="relative z-10">{chunks}</span>
                    <svg
                      className="absolute fill-zinc-300 w-[calc(100%+1rem)]"
                      xmlns="http://www.w3.org/2000/svg"
                      width="120"
                      height="10"
                      viewBox="0 0 120 10"
                      aria-hidden="true"
                      preserveAspectRatio="none"
                    >
                      <path d="M118.273 6.09C79.243 4.558 40.297 5.459 1.305 9.034c-1.507.13-1.742-1.521-.199-1.81C39.81-.228 79.647-1.568 118.443 4.2c1.63.233 1.377 1.943-.17 1.89Z" />
                    </svg>
                  </em>
                ),
              })}{" "}
            </h2>
            <p className="text-lg text-synergy-dark-grey mb-8">
              {t("description")}
            </p>
            <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                className="btn !rounded-xl !py-4 !text-base backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue shadow-xl text-white w-full group"
                href={t("buttons.buttonLeft.href")}
              >
                <span className="inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                  {t("buttons.buttonLeft.text")}
                  <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    {"->"}
                  </span>
                </span>
              </Link>
              <Link
                className="btn !rounded-xl !text-base text-synergy-dark-grey bg-white hover:text-zinc-900 w-full shadow-xl"
                href={t("buttons.buttonLeft.href")}
              >
                {t("buttons.buttonLeft.text")}
              </Link>
            </div>
          </div>
          {/* Clients */}
          <div className="text-center">
            <ul className="inline-flex flex-wrap items-center justify-center -m-2 [mask-image:linear-gradient(to_right,transparent_8px,_theme(colors.white/.7)_64px,_theme(colors.white)_50%,_theme(colors.white/.7)_calc(100%-64px),_transparent_calc(100%-8px))]">
              {parterKeys.map((parterKey, index) => (
                <li key={index} className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                  <Image
                    loader={ImageLoader}
                    src={t(`partners.${parterKey}.src`)}
                    width={Number(t(`partners.${parterKey}.width`))}
                    height={Number(t(`partners.${parterKey}.height`))}
                    alt={t(`partners.${parterKey}.alt`)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaLoose;
