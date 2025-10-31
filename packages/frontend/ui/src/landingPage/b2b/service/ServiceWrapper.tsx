import Image from "next/image";
import ImageLoader from "../../../shared/utils/image/ImageLoader";
import DiamondClips from "../../shared/ui/clips/DiamondClips";
import ServiceComponents from "./ServiceComponents";
import ServiceBackground from "./ServiceBackground";
import { useMessages, useTranslations } from "next-intl";
import SingleServiceWrapper from "./SingleServiceWrapper";

/* eslint-disable-next-line */
export interface ServiceWrapperProps {}

export const ServiceWrapper = (props: ServiceWrapperProps) => {
  const messages: any = useMessages();
  const t = useTranslations("LandingPage.B2B.Services");

  const services = Object.keys(messages.LandingPage.B2B.Services);

  const DiamondClipsArray = [
    {
      src: "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/FeatureSteps/scenic-house-photovoltaic.jpg",
      alt: "Projektakquise",
      text: "Projektakquise",
    },
    {
      src: "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/FeatureSteps/scenic-house-photovoltaic.jpg",
      alt: "Beratung",
      text: "Beratung",
    },
    {
      src: "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/FeatureSteps/scenic-house-photovoltaic.jpg",
      alt: "Energievertrieb",
      text: "Energievertrieb",
    },
    {
      src: "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/FeatureSteps/scenic-house-photovoltaic.jpg",
      alt: "Marketing",
      text: "Marketing",
    },
    // {
    //   src: "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/FeatureSteps/scenic-house-photovoltaic.jpg",
    //   alt: "Vermittlung",
    //   text: "Vermittlung",
    // },
  ];

  return (
    <div className="">
      <div className="">
        <ol className="relative border-s-0 border-gray-200 dark:border-gray-700">
          {services.map((service, index) => (
            <SingleServiceWrapper key={index} service={service} />
          ))}

          {/* <li className="ms-6 mt-6">
            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Released on December 2nd, 2021
            </time>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              Get started with dozens of web components and interactive elements
              built on top of Tailwind CSS.
            </p>
          </li> */}
        </ol>
      </div>
    </div>
  );
};

export default ServiceWrapper;
