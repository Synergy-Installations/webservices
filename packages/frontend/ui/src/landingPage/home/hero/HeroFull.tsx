import Image from "next/image";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import HeroFullImage from "../../../shared/images/house-technical-illustration.jpg";
import ProductPreviewSmall from "@com.synergy/frontend-ui/ProductPreviewSmall";
import { Marquee } from "@com.synergy/frontend-ui/Marquee";

/* eslint-disable-next-line */
export interface HeroFullProps {}

export const HeroFull = (props: HeroFullProps) => {
  return (
    <div className="h-svh w-svw min-h-[993px] relative">
      <div className="z-10 relative h-full flex flex-col items-center justify-center lg:block lg:pt-[265px] lg:pl-[140px] w-auto">
        <ProductPreviewSmall />
        <h1 className="mb-6 mt-5 border-y text-5xl font-bold w-fit text-white [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-6xl">
          Preisstabil
        </h1>
        <div className="relative w-fit mt-20 before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
          <div
            className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
            data-aos="zoom-y-out"
            data-aos-delay={450}
          >
            <Link
              className="btn group mb-4 !py-4 !px-5 !text-lg w-full bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
              href={"/"}
            >
              <span className="relative inline-flex items-center">
                <span className="ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                  Hier ihr Vorteil
                  <span className="text-yellow-300">{" ->"}</span>
                </span>
              </span>
            </Link>
            <Link
              className="btn w-full !text-base bg-white text-gray-800 shadow hover:bg-gray-50 sm:ml-4 sm:w-auto"
              href={"/"}
            >
              Unsere Produkte
            </Link>
          </div>
        </div>
      </div>
      <div className="z-10 w-[calc(105vw)] absolute bottom-[80px] rotate-[-5deg] bg-orange-500">
        <Marquee pauseOnHover className="[--duration:20s] p-1">
          <div className="text-[#eeeae8] text-4xl font-bold uppercase">
            Einfach Geld Sparen * Endlich Unabhängig * Zuverlässig *&nbsp;
          </div>
        </Marquee>
      </div>
      <Image
        src={HeroFullImage}
        width={undefined}
        height={undefined}
        fill={true}
        className="object-cover min-h-[993px] object-[80%_0%]"
        alt=""
      />
    </div>
  );
};

export default HeroFull;
