import Image from "next/image";
import ImageLoader from "@com.synergy/frontend-ui/ImageLoader";
import { BentoItem } from "./BentoGrid";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";

/* eslint-disable-next-line */
export interface BentoCardProps extends BentoItem {}

/* ------------------------------------------------------------------
 * <BentoCard> – handles spanning and visual treatment
 * ----------------------------------------------------------------*/
export const BentoCard = (props: BentoCardProps) => {
  const {
    image,
    title,
    description,
    rowSpan = 1,
    colSpan = 1,
    button: { link, text: buttonText },
  } = props;

  return (
    <Link
      href={link}
      className="relative rounded-2xl overflow-hidden shadow-lg"
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        gridRow: `span ${rowSpan} / span ${rowSpan}`,
      }}
    >
      <div className="">
        {/* Background image */}
        <Image
          src={image}
          loader={ImageLoader}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Copy */}
        <div className="absolute bottom-0 left-0 p-4 text-white w-full">
          {/* <p className="relative min-w-[288px] z-10 bottom-0 text-white text-left pl-6 font-semibold text-4xl transition-all truncate">
          {service.title}
        </p>
        <p className="relative bottom-0 z-10 left-0 h-0 group-hover:h-auto text-white text-left -m-12 mt-8 group-hover:mt-0 mx-6 opacity-100 group-hover:opacity-100 group-hover:pb-12 text-md transition-transform">
          {service.description}
        </p> */}
          <div className="flex items-end justify-between gap-4">
            <div className="">
              <h3 className="text-base md:text-3xl font-semibold leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-sm md:text-base opacity-100 whitespace-pre-wrap font-normal">
                  {description}
                </p>
              )}
              <button className="hidden md:flex relative items-center w-fit mt-2 py-1.5 bottom-0 left-0 px-3 text-white rounded-lg backdrop-blur-md bg-gradient-to-t from-synergy-light-blue via-synergy-light-blue/70 to-synergy-light-blue hover:from-synergy-light-blue hover:to-synergy-light-blue shadow-xl group-hover:opacity-100 text-xs md:text-sm transition-all">
                <p className="">{buttonText}</p>
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="">
              {/* Redirect icon at bottom right */}
              <span className="flex md:hidden items-center justify-center bg-white/20 rounded-full p-2">
                <ArrowRightIcon className="h-5 w-5 text-white" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BentoCard;
