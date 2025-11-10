"use client";

import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import { ImageLoader } from "../../../shared/utils/image/ImageLoader";
import { Marquee } from "../../../shared/marquee/Marquee";
import { isTrueSet } from "../../../shared/utils/math/Boolean";

/* eslint-disable-next-line */
export interface B2bPartnersSectionProps {}

export const B2bPartnersSection = (props: B2bPartnersSectionProps) => {
  const t = useTranslations("LandingPage.B2B.Partners");
  const messages = useMessages();
  const partnerLogos =
    ((messages as any)?.LandingPage?.B2B?.Partners?.logos as string[]) || [];

  return (
    <section className="bg-white py-20 w-full">
      <div
        className="container mx-auto px-6 lg:px-0 text-center mb-8"
        data-aos="fade-up"
      >
        <h2 className="text-3xl md:text-4xl font-bold">{t("title")}</h2>
      </div>
      <div className="container mx-auto px-6 lg:px-0">
        <ul
          className="flex items-center justify-center space-x-6 overflow-x-auto [mask-image:_linear-gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)]"
          data-aos="fade-right"
        >
          <Marquee
            pauseOnHoverProp={isTrueSet("true")}
            reverse={isTrueSet("true")}
            className="![--duration:30s]"
          >
            {partnerLogos.map((logo) => (
              <li
                key={logo}
                className="snap-center flex-shrink-0 w-40 h-24 flex items-center justify-center bg-gray-100 rounded-lg p-4"
              >
                <Image
                  loader={ImageLoader}
                  width={160}
                  height={80}
                  src={logo}
                  alt={t("logoAlt")}
                  className="max-h-full max-w-full object-contain"
                />
              </li>
            ))}
          </Marquee>
        </ul>
      </div>
    </section>
  );
};

export default B2bPartnersSection;
