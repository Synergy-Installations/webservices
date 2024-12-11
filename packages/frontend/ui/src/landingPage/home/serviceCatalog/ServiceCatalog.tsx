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

import {
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons";
import { Share2Icon, BellIcon } from "lucide-react";
import Image from "next/image";

/* eslint-disable-next-line */
export interface ServiceCatalogProps {}

const features = [
  {
    type: "simple",
    Icon: FileTextIcon,
    name: "Photovoltaic",
    description: "We automatically save your files as you type.",
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
    className: "col-span-2 lg:col-span-1",
  },
  {
    type: "simple",
    Icon: InputIcon,
    name: "Heat Pump",
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
    className: "col-span-2 lg:col-span-1",
  },
  {
    type: "simple",
    Icon: InputIcon,
    name: "Air Conditioner",
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
    className: "col-span-2 lg:col-span-1",
  },
  {
    type: "simple",
    Icon: FileTextIcon,
    name: "Electrical Installations",
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
    className: "col-span-2 lg:col-span-1",
  },
  {
    type: "simple",
    borderAnimation: "shine",
    Icon: Share2Icon,
    name: "Energy Management System",
    description: "Supports 100+ integrations and counting.",
    href: "#",
    cta: "Learn more",
    className: "col-span-2 lg:col-span-1 bg-slate-50",
    background: (
      <AnimatedBeamMultipleOutputs className="absolute right-2 top-4 h-[275px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    type: "simple",
    borderAnimation: "beam",
    Icon: BellIcon,
    name: "Energy Community",
    description: "Get notified when something happens.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1 bg-slate-50",
    background: (
      <AnimatedListEnergyCommunity className="absolute right-2 top-4 h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
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
  return (
    <section className="relative" id="products">
      <div className="mx-auto px-4 sm:px-6">
        {/* Hero content */}
        <div className="pb-12 pt-0 md:pb-20 md:pt-0">
          {/* Section header */}
            <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-20">
              <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                Produkte die unerlässlich sind
              </h2>
              <p className="text-lg text-zinc-500">
                Whenever you are ready, just hit publish to turn your site
                sketches into an actual designs. No creating, no skills, no
                reshaping.
              </p>
            </div>
          <div className="pb-12 mx-auto max-w-6xl text-center relative z-10 md:pb-16">
            <BentoGrid className="lg:grid-rows-3">
              {features.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
              ))}
            </BentoGrid>
          </div>
          <DotPattern className="[mask-image:linear-gradient(0deg,transparent_0%,white_20%,white_90%,transparent_100%)] mt-20 fill-slate-400/60" />
        </div>
        {/* <LargeTestimonial /> */}
      </div>
    </section>
  );
};

export default ServiceCatalog;
