import { BentoCard } from "@com.synergy/frontend-ui/BentoCard";
import { BentoGrid } from "@com.synergy/frontend-ui/BentoGrid";
// import Photovoltaic from "../../../shared/images/photovoltaic-real.jpeg";
// import HeatPump from "../../../shared/images/heat-pump.jpg";
// import AirConditioner from "../../../shared/images/air-conditioner.jpg";
// import ElectricalInstallation from "../../../shared/images/electrical-installation.jpg";
import { AnimatedBeamMultipleOutputs } from "@com.synergy/frontend-ui/AnimatedBeamMultipleOutputs";
import { AnimatedListEnergyCommunity } from "@com.synergy/frontend-ui/AnimatedListEnergyCommunity";
import { DotPattern } from "@com.synergy/frontend-ui/DotPattern";
import { LargeTestimonial } from "@com.synergy/frontend-ui/LargeTestimonial";
import { HeroHomeIllustration } from "@com.synergy/frontend-ui/HeroHomeIllustration";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
// import Client01 from "../../../shared/images/client-01.svg";
// import Client02 from "../../../shared/images/client-02.svg";
// import Client03 from "../../../shared/images/client-03.svg";
// import Client04 from "../../../shared/images/client-04.svg";
// import Client05 from "../../../shared/images/client-05.svg";
// import Client06 from "../../../shared/images/client-06.svg";
// import Client07 from "../../../shared/images/client-07.svg";
// import Client08 from "../../../shared/images/client-08.svg";
// import Client09 from "../../../shared/images/client-09.svg";
// import Client10 from "../../../shared/images/client-10.svg";
import { Marquee } from "@com.synergy/frontend-ui/Marquee";
import { TracingBeam } from "@com.synergy/frontend-ui/TracingBeam";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import { isTrueSet } from "@com.synergy/frontend-ui/Boolean";

import {
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons";
import { Share2Icon, BellIcon } from "lucide-react";
import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import { ServiceCard } from "@com.synergy/frontend-ui/ServiceCard";

/* eslint-disable-next-line */
export interface ServiceCatalogProps {}

interface PartnerCarouselItems {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const ServiceCatalog = (props: ServiceCatalogProps) => {
  const t = useTranslations("LandingPage.Home.ServiceCatalog");

  const messages: any = useMessages();
  const serviceKeys = Object.keys(
    messages.LandingPage.Home.ServiceCatalog.servicesGrid
  );

  const partnerCarouselKeys = Object.keys(
    messages.LandingPage.Home.ServiceCatalog.partnerCarousel
  );

  const getPartnerCarouselItems = (key: string): string[] => {
    return (
      Object.keys(
        messages.LandingPage.Home.ServiceCatalog.partnerCarousel[key].partners
      ) || []
    );
  };

  return (
    <section className="relative" id="products">
      <HeroHomeIllustration />
      <div className="mx-auto pb-12 pt-20 md:pt-40">
        {/* Hero content */}
        <div className="pb-12 pt-0 md:pb-20 md:pt-0">
          {/* Section header */}
          <div className="pb-12 px-4 sm:px-6 mx-auto max-w-6xl text-center md:pb-16 relative z-10">
            <h1
              className="mb-6 border-y text-5xl font-bold [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-6xl"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              <RichText>{(tags) => t.rich("title", tags)}</RichText>
            </h1>
            <div className="mx-auto max-w-3xl">
              {/* <p
                className="mb-8 text-lg text-gray-700"
                data-aos="zoom-y-out"
                data-aos-delay={300}
              >
                {t("body")}
              </p> */}
              <div className="relative">
                <div
                  className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
                  data-aos="zoom-y-out"
                  data-aos-delay={450}
                >
                  <Link
                    className="btn !rounded-xl !py-4 !text-base group mb-4 w-full backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue shadow-xl text-white sm:mb-0 sm:w-auto"
                    href={t("buttons.buttonLeft.href")}
                  >
                    <span className="relative inline-flex items-center tracking-normal">
                      {/* {t.rich("buttons.buttonLeft.value", {
                        arrow: (chunks) => (
                          <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                            {chunks}
                          </span>
                        ),
                      })} */}
                      <span className="ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                        <span className="inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                          {t("buttons.buttonLeft.text")}
                          <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                            {"->"}
                          </span>
                        </span>
                      </span>
                    </span>
                  </Link>
                  <Link
                    className="btn !rounded-xl !text-base w-full bg-white text-synergy-dark-grey shadow-xl hover:bg-synergy-light-grey sm:ml-4 sm:w-auto"
                    href={t("buttons.buttonRight.href")}
                  >
                    {t("buttons.buttonRight.text")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="pb-12 px-4 sm:px-6 mx-auto max-w-6xl text-center relative z-10 md:pb-16">
            <BentoGrid className="md:grid-rows-3">
              <ServiceCard
                services={serviceKeys.map(
                  (key) =>
                    messages.LandingPage.Home.ServiceCatalog.servicesGrid[key]
                )}
              />
            </BentoGrid>
          </div>
          <div className="py-12 md:py-20">
            {/* Clients carousel */}
            <div className="relative z-10 before:absolute before:inset-0 before:w-32 before:z-10 before:pointer-events-none before:bg-gradient-to-r before:from-slate-50 after:absolute after:inset-0 after:left-auto after:w-32 after:z-10 after:pointer-events-none after:bg-gradient-to-l after:from-slate-50">
              <div className="!ease-linear select-none">
                {/* Carousel items */}
                {partnerCarouselKeys.map((partnerCarouselKey, index) => (
                  <Marquee
                    pauseOnHoverProp={isTrueSet(
                      t(`partnerCarousel.${partnerCarouselKey}.pauseOnHover`)
                    )}
                    reverse={isTrueSet(
                      t(`partnerCarousel.${partnerCarouselKey}.reverse`)
                    )}
                    key={index}
                    className="[--duration:200s]"
                  >
                    {getPartnerCarouselItems(partnerCarouselKey).map(
                      (partnerKey, index) => (
                        <div className="swiper-slide !h-32 !min-w-32 p-4 overflow-hidden bg-gray-200 rounded-2xl flex items-center justify-center group">
                          <Image
                            className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                            loader={ImageLoader}
                            width={Number(
                              t(
                                `partnerCarousel.${partnerCarouselKey}.partners.${partnerKey}.width`
                              )
                            )}
                            height={Number(
                              t(
                                `partnerCarousel.${partnerCarouselKey}.partners.${partnerKey}.height`
                              )
                            )}
                            src={t(
                              `partnerCarousel.${partnerCarouselKey}.partners.${partnerKey}.src`
                            )}
                            alt={t(
                              `partnerCarousel.${partnerCarouselKey}.partners.${partnerKey}.alt`
                            )}
                          />
                        </div>
                      )
                    )}
                  </Marquee>
                ))}
              </div>
            </div>
          </div>
          {/* <DotPattern className="[mask-image:linear-gradient(0deg,transparent_0%,white_20%,white_50%,transparent_100%)] mt-20 fill-slate-400/60" /> */}
        </div>
        {/* <LargeTestimonial /> */}
      </div>
    </section>
  );
};

export default ServiceCatalog;
