import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import Image from "next/image";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BorderBeam } from "@com.synergy/frontend-ui/BorderBeam";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";

/* eslint-disable-next-line */
export interface ServiceCardProps {
  services: {
    title: string;
    description: string;
    image: {
      src: string;
      alt: string;
    };
    button: {
      text: string;
      href: string;
    };
  }[];
  alwaysShowContent?: boolean;
}

export const ServiceCard = ({
  services,
  alwaysShowContent = false,
}: ServiceCardProps) => {
  return (
    <>
      {services.map((service, index) => {
        const titleClassName = [
          "relative min-w-[288px] z-10 bottom-0 text-white text-left pl-6 font-semibold text-2xl md:text-4xl transition-all",
          alwaysShowContent ? "line-clamp-2" : "truncate",
        ].join(" ");

        const descriptionClassName = [
          "relative bottom-0 z-10 left-0 text-white text-left mx-6 text-base md:text-md transition-transform",
          alwaysShowContent
            ? "opacity-100 mt-0 pt-1 pb-1 h-auto"
            : "h-0 -m-12 mt-8 opacity-100 group-hover:h-auto group-hover:mt-0 group-hover:pb-12 group-hover:opacity-100",
        ].join(" ");

        const buttonClassName = [
          "relative z-10 flex items-center w-fit py-1.5 bottom-0 left-0 ml-6 px-3 text-white rounded-lg backdrop-blur-md bg-gradient-to-t from-synergy-light-blue via-synergy-light-blue/70 to-synergy-light-blue hover:from-synergy-light-blue hover:to-synergy-light-blue shadow-xl text-sm transition-all",
          alwaysShowContent
            ? "opacity-100 mt-3 mb-6"
            : "opacity-0 group-hover:opacity-100 group-hover:mb-6 group-hover:mt-3",
        ].join(" ");

        return (
          <Link
            href={service.button.href}
            key={index}
            className={`group relative h-[298px] rounded-2xl overflow-hidden col-span-2 md:col-span-1`}
          >
            <Image
              loader={ImageLoader}
              src={service.image.src}
              alt={service.image.alt}
              width={0}
              height={0}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 flex flex-col w-full">
              <p className={titleClassName}>{service.title}</p>
              <p className={descriptionClassName}>{service.description}</p>
              <button className={buttonClassName}>
                <p className="">{service.button.text}</p>
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
              <div className="absolute w-full h-[130%] bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent to-100% transition-all"></div>
            </div>
            {/* {borderAnimation === "beam" && ( */}
            {/* <BorderBeam size={250} duration={12} delay={9} /> */}
            {/* )} */}
          </Link>
        );
      })}
    </>
  );
};

export default ServiceCard;
