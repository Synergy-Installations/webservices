"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef } from "react";

/* eslint-disable-next-line */
export interface AboutCtaProps {}

export const AboutCta = (props: AboutCtaProps) => {
  const t = useTranslations("LandingPage.About.CTA");
  const testRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-slate-100">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="relative max-w-3xl mx-auto text-center">
            <div
              className="absolute right-0 -mt-4 -mr-1 fill-slate-300 hidden lg:block"
              aria-hidden="true"
            >
              <svg className="fill-slate-300" width="56" height="43">
                <path d="M4.532 30.45C15.785 23.25 24.457 12.204 29.766.199c.034-.074-.246-.247-.3-.186-4.227 5.033-9.298 9.282-14.372 13.162C10 17.07 4.919 20.61.21 24.639c-1.173 1.005 2.889 6.733 4.322 5.81M18.96 42.198c12.145-4.05 24.12-8.556 36.631-12.365.076-.024.025-.349-.055-.347-6.542.087-13.277.083-19.982.827-6.69.74-13.349 2.24-19.373 5.197-1.53.75 1.252 7.196 2.778 6.688" />
              </svg>
            </div>

            <div className="relative">
              <h2 className="h2 text-4xl font-bold -tracking-[0.01em] font-inter text-slate-800 mb-4">
                {t("title")}
              </h2>
              <p className="text-xl text-slate-500 mb-8">{t("body")}</p>
              <div className="relative mx-auto grid xs:flex gap-4 sm:w-fit mt-12 sm:mt-6 before:hidden before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
                <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center items-center">
                  <Link
                    className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line flex items-center justify-center h-full"
                    href={t("button.href")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line justify-center">
                      {t("button.text")}
                      <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                        <div className=" whitespace-nowrap">{"->"}</div>
                      </div>
                    </span>
                  </Link>
                </div>
                {/* <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                  <Link
                    className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line"
                    href={"/contact-us-funnel"}
                  >
                    <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line">
                      Buchen Sie Ihre PV Montage
                      <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                        <div className=" whitespace-nowrap">{"->"}</div>
                      </div>
                    </span>
                  </Link>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCta;
