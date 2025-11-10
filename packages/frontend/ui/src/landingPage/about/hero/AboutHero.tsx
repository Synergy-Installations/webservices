import Image from "next/image";
import { useTranslations } from "next-intl";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface AboutHeroProps {}

export const AboutHero = (props: AboutHeroProps) => {
  const t = useTranslations("LandingPage.About.Hero");

  return (
    <section className="relative">
      {/* Dark background */}
      <div
        className="absolute inset-0 bg-synergy-light-blue pointer-events-none mb-48 lg:mb-0 lg:h-[30rem]"
        aria-hidden="true"
      >
        <div className="w-full h-full" data-aos="fade">
          <Image
            className="opacity-20 w-full h-full object-cover"
            loader={ImageLoader}
            src={t("background.src")}
            width={1440}
            height={497}
            // priority
            alt={t("background.alt")}
          />
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 md:pt-40">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-16">
            <h1 className="h1 text-4xl md:text-6xl font-bold !-tracking-[0.01em] font-inter text-slate-100">
              {t("title")}
            </h1>
          </div>

          {/* Hero image */}
          <div
            className="flex justify-center items-center"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <Image
              className="mx-auto rounded-2xl"
              loader={ImageLoader}
              src={t("image.src")}
              width={1024}
              height={576}
              // priority
              alt={t("image.alt")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
