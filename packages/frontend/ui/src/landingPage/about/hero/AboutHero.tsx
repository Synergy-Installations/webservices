import Image from "next/image";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface AboutHeroProps {}

export const AboutHero = (props: AboutHeroProps) => {
  return (
    <section className="relative">
      {/* Dark background */}
      <div
        className="absolute inset-0 bg-slate-900 pointer-events-none mb-48 lg:mb-0 lg:h-[30rem]"
        aria-hidden="true"
      >
        <div className="w-full h-full" data-aos="fade">
          <Image
            className="opacity-10 w-full h-full object-cover"
            loader={ImageLoader}
            src={"/frontend/landingPage/about/about-hero.jpg"}
            width={1440}
            height={497}
            // priority
            alt="Hero"
          />
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 md:pt-40">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-16">
            <h1 className="h1 text-5xl md:text-6xl font-bold !-tracking-[0.01em] font-inter text-slate-100">
              Wir gestalten die Zukunft der Installationstechnik
            </h1>
          </div>

          {/* Hero image */}
          <div
            className="flex justify-center items-center"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <Image
              className="mx-auto"
              loader={ImageLoader}
              src={
                "/frontend/landingPage/about/IMG_0398_compressed_cropped.jpeg"
              }
              width={1024}
              height={576}
              // priority
              alt="About intro"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
