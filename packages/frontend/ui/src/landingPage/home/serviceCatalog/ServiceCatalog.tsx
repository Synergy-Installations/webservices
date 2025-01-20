import { BentoCard } from "@com.synergy/frontend-ui/BentoCard";
import { BentoGrid } from "@com.synergy/frontend-ui/BentoGrid";
import Photovoltaic from "../../../shared/images/photovoltaic-real.jpeg";
import HeatPump from "../../../shared/images/heat-pump.jpg";
import AirConditioner from "../../../shared/images/air-conditioner.jpg";
import ElectricalInstallation from "../../../shared/images/electrical-installation.jpg";
import { AnimatedBeamMultipleOutputs } from "@com.synergy/frontend-ui/AnimatedBeamMultipleOutputs";
import { AnimatedListEnergyCommunity } from "@com.synergy/frontend-ui/AnimatedListEnergyCommunity";
import { DotPattern } from "@com.synergy/frontend-ui/DotPattern";
import { LargeTestimonial } from "@com.synergy/frontend-ui/LargeTestimonial";
import { HeroHomeIllustration } from "@com.synergy/frontend-ui/HeroHomeIllustration";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import Client01 from "../../../shared/images/client-01.svg";
import Client02 from "../../../shared/images/client-02.svg";
import Client03 from "../../../shared/images/client-03.svg";
import Client04 from "../../../shared/images/client-04.svg";
import Client05 from "../../../shared/images/client-05.svg";
import Client06 from "../../../shared/images/client-06.svg";
import Client07 from "../../../shared/images/client-07.svg";
import Client08 from "../../../shared/images/client-08.svg";
import Client09 from "../../../shared/images/client-09.svg";
import Client10 from "../../../shared/images/client-10.svg";
import { Marquee } from "@com.synergy/frontend-ui/Marquee";
import { TracingBeam } from "@com.synergy/frontend-ui/TracingBeam";
import { RichText } from "@com.synergy/frontend-ui/RichText";

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

const features = [
  {
    type: "simple",
    Icon: FileTextIcon,
    name: "Photovoltaik",
    description:
      "We automatically save your files as you type. and nthiesrt ir stiersnt",
    href: "/",
    cta: "Learn more",
    background: (
      <Image
        src={Photovoltaic}
        width={0}
        height={0}
        alt="Avatar 01"
        className="object-cover w-full h-full"
      />
    ),
    className: "col-span-2 md:col-span-1",
  },
  {
    type: "simple",
    Icon: InputIcon,
    name: "Warmepumpe",
    description: "Search through all your files in one place.",
    href: "/",
    cta: "Learn more",
    background: (
      <Image
        src={HeatPump}
        width={1350}
        height={675}
        alt="Avatar 01"
        className="object-cover w-full h-full"
      />
    ),
    className: "col-span-2 md:col-span-1",
  },
  {
    type: "simple",
    Icon: InputIcon,
    name: "Klimaanlage",
    description: "Search through all your files in one place.",
    href: "/",
    cta: "Learn more",
    background: (
      <Image
        src={AirConditioner}
        width={1350}
        height={675}
        alt="Avatar 01"
        className="object-cover w-full h-full"
      />
    ),
    className: "col-span-2 md:col-span-1",
  },
  {
    type: "simple",
    Icon: FileTextIcon,
    name: "Smart Home",
    description: "We automatically save your files as you type.",
    href: "/",
    cta: "Learn more",
    background: (
      <Image
        src={ElectricalInstallation}
        width={0}
        height={0}
        alt="Avatar 01"
        className="object-cover w-full h-full"
      />
    ),
    className: "col-span-2 md:col-span-1",
  },
  {
    type: "simple",
    Icon: FileTextIcon,
    name: "Batterie",
    description: "We automatically save your files as you type.",
    href: "/",
    cta: "Learn more",
    background: (
      <Image
        src={ElectricalInstallation}
        width={0}
        height={0}
        alt="Avatar 01"
        className="object-cover w-full h-full"
      />
    ),
    className: "col-span-2 md:col-span-1",
  },
  {
    type: "simple",
    Icon: FileTextIcon,
    name: "Wallbox",
    description: "We automatically save your files as you type.",
    href: "/",
    cta: "Learn more",
    background: (
      <Image
        src={ElectricalInstallation}
        width={0}
        height={0}
        alt="Avatar 01"
        className="object-cover w-full h-full"
      />
    ),
    className: "col-span-2 md:col-span-1",
  },
  // {
  //   type: "simple",
  //   borderAnimation: "shine",
  //   Icon: Share2Icon,
  //   name: "Energy Management System",
  //   description: "Supports 100+ integrations and counting.",
  //   href: "#",
  //   cta: "Learn more",
  //   className: "col-span-2 lg:col-span-1 bg-slate-50",
  //   background: (
  //     <AnimatedBeamMultipleOutputs className="absolute right-2 top-4 h-[280px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
  //   ),
  // },
  // {
  //   type: "simple",
  //   borderAnimation: "beam",
  //   Icon: BellIcon,
  //   name: "Energy Community",
  //   description: "Get notified when something happens.",
  //   href: "#",
  //   cta: "Learn more",
  //   className: "col-span-3 lg:col-span-1 bg-slate-50",
  //   background: (
  //     <AnimatedListEnergyCommunity className="absolute right-2 top-4 h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
  //   ),
  // },
  // {
  //   Icon: GlobeIcon,
  //   name: "Multilingual",
  //   description: "Supports 100+ languages and counting.",
  //   href: "/",
  //   cta: "Learn more",
  //   background: <img className="absolute -right-20 -top-20 opacity-60" />,
  //   className: "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3",
  // },
  // {
  //   Icon: CalendarIcon,
  //   name: "Calendar",
  //   description: "Use the calendar to filter your files by date.",
  //   href: "/",
  //   cta: "Learn more",
  //   background: <img className="absolute -right-20 -top-20 opacity-60" />,
  //   className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3",
  // },
  // {
  //   Icon: BellIcon,
  //   name: "Notifications",
  //   description:
  //     "Get notified when someone shares a file or mentions you in a comment.",
  //   href: "/",
  //   cta: "Learn more",
  //   background: <img className="absolute -right-20 -top-20 opacity-60" />,
  //   className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  // },
];

export const ServiceCatalog = (props: ServiceCatalogProps) => {
  const t = useTranslations("LandingPage.Home.ServiceCatalog");

  const messages = useMessages();
  const serviceKeys = Object.keys(
    messages.LandingPage.Home.ServiceCatalog.servicesGrid
  );

  return (
    <section className="relative" id="products">
      <HeroHomeIllustration />
      <div className="mx-auto pb-12 pt-32 md:pt-40">
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
                    href={"/"}
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
                          Jetzt Anfragen
                          <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                            {"->"}
                          </span>
                        </span>
                      </span>
                    </span>
                  </Link>
                  <Link
                    className="btn !rounded-xl !text-base w-full bg-white text-synergy-dark-grey shadow-xl hover:bg-synergy-light-grey sm:ml-4 sm:w-auto"
                    href={"/"}
                  >
                    Detaillierte Ansicht
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
                <Marquee pauseOnHoverProp className="[--duration:20s]">
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client01}
                      alt="Client 01"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client02}
                      alt="Client 02"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client03}
                      alt="Client 03"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client04}
                      alt="Client 04"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client05}
                      alt="Client 05"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client06}
                      alt="Client 06"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client07}
                      alt="Client 07"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client08}
                      alt="Client 08"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client09}
                      alt="Client 09"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client10}
                      alt="Client 10"
                    />
                  </div>
                </Marquee>
                <Marquee pauseOnHoverProp reverse className="[--duration:20s]">
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client01}
                      alt="Client 01"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client02}
                      alt="Client 02"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client03}
                      alt="Client 03"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client04}
                      alt="Client 04"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client05}
                      alt="Client 05"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client06}
                      alt="Client 06"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client07}
                      alt="Client 07"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client08}
                      alt="Client 08"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client09}
                      alt="Client 09"
                    />
                  </div>
                  <div className="swiper-slide !h-32 !w-32 bg-gray-200 rounded-2xl flex items-center justify-center group">
                    <Image
                      className="opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      src={Client10}
                      alt="Client 10"
                    />
                  </div>
                </Marquee>
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
