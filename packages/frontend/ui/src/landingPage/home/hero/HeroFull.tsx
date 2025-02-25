import Image from "next/image";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import HeroFullImage from "../../../shared/images/house-technical-illustration-3.jpg";
import ProductPreviewSmall from "@com.synergy/frontend-ui/ProductPreviewSmall";
import { Transition } from "@headlessui/react";
import { Marquee } from "@com.synergy/frontend-ui/Marquee";
import { WordRotate } from "@com.synergy/frontend-ui/WordRotate";
import { useMessages, useTranslations } from "next-intl";
import ProductPreviewSmallTransition from "@com.synergy/frontend-ui/ProductPreviewSmallTransition";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface HeroFullProps {}

export const HeroFull = (props: HeroFullProps) => {
  const t = useTranslations("LandingPage.Home.Hero");

  const messages: any = useMessages();
  const productPreviewKeys = Object.keys(
    messages.LandingPage.Home.Hero.productPreviewSmall
  );

  return (
    <div className="h-svh w-svw min-h-[993px] relative">
      <div className="z-10 relative h-screen flex flex-col items-center justify-center lg:block lg:pt-[204px] lg:pl-[140px] xl:pl-[200px] 2xl:pl-[300px] min-[1700px]:pl-[350px] min-[1700px]:pt-[194px] w-auto">
        <div className="relative flex flex-col w-[272px] rounded-2xl">
          <ProductPreviewSmallTransition
            products={productPreviewKeys.map(
              (key) => messages.LandingPage.Home.Hero.productPreviewSmall[key]
            )}
          />
        </div>
        {/* <h1 className="mb-6 mt-5 py-2 border-y text-5xl font-bold w-fit text-white [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-6xl">
          Preisstabil
        </h1> */}
        <div className="mb-6 mt-5 w-fit border-y [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
          <WordRotate
            className="text-5xl font-bold w-fit text-white md:text-6xl"
            words={t("rotatingText").split(",")}
          />
        </div>
        <div className="relative w-fit mt-20 before:absolute before:inset-0 before:border-none before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
          <div
            className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
            // data-aos="zoom-y-out"
            // data-aos-delay={450}
          >
            <Link
              className="btn relative group mb-4 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:mb-0 sm:w-auto"
              href={t("buttons.buttonLeft.href")}
            >
              <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                {t("buttons.buttonLeft.text")}
                <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                  {"->"}
                </span>
              </span>
            </Link>
            <Link
              className="btn w-full !rounded-xl !text-base bg-white text-gray-800 shadow hover:bg-synergy-light-grey sm:ml-4 sm:w-auto"
              href={t("buttons.buttonRight.href")}
            >
              {t("buttons.buttonRight.text")}
            </Link>
          </div>
        </div>
      </div>
      <div className="z-10 w-[calc(105vw)] absolute bottom-[170px] xl:bottom-[195px] 2xl:bottom-[80px] -left-[10px] rotate-[-5deg] bg-orange-500">
        <Marquee className="![--duration:150s] p-1">
          <div className="text-[#eeeae8] text-4xl font-bold uppercase pr-2">
            {t("banner")}&nbsp;
          </div>
        </Marquee>
      </div>

      <Image
        loader={ImageLoader}
        src={t("image.src")}
        width={undefined}
        height={undefined}
        fill={true}
        className="object-cover min-h-[993px] object-[60%_100%] sm:object-[70%_100%] md:object-[70%_100%] lg:object-[50%_100%] xl:object-[40%_50%] 2xl:object-[60%_50%]"
        alt={t("image.alt")}
      />
      <div className="absolute inset-0 bg-black/20 lg:bg-transparent"></div>
    </div>
  );
};

export default HeroFull;
