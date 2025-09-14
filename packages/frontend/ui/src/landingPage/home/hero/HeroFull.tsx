import Image from "next/image";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
// import HeroFullImage from "../../../shared/images/house-technical-illustration-3.jpg";
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
  const blueBoxes = Object.keys(messages.LandingPage.Home.Hero.blueBoxes);

  return (
    <div className="h-svh w-svw max-h-[993px] relative">
      <div className="z-10 relative h-screen flex flex-col items-center justify-center lg:block lg:pt-[204px] lg:pl-[140px] xl:pl-[200px] 2xl:pl-[300px] min-[1700px]:pl-[350px] min-[1700px]:pt-[194px] w-auto">
        <div className="relative flex flex-col justify-center rounded-2xl">
          <ProductPreviewSmallTransition
            products={productPreviewKeys.map(
              (key) => messages.LandingPage.Home.Hero.productPreviewSmall[key]
            )}
          />
        </div>
        <div className="mb-6 mt-5 w-fit border-y [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
          <WordRotate
            className="text-5xl font-bold w-fit text-white md:text-6xl"
            words={t("rotatingText").split(",")}
          />
        </div>
        <div className="relative w-fit mt-20 before:absolute before:inset-0 before:border-none before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
          <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
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
        {/* Blue boxes at the bottom center */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-6 z-20">
          {blueBoxes.map((i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-start gap-2 px-6 py-4 rounded-2xl bg-synergy-light-blue/70 backdrop-blur-md shadow-lg min-w-[220px] max-w-[260px]"
            >
              {/* <div className="mb-2">
                <svg
                  width={32}
                  height={32}
                  fill="none"
                  viewBox="0 0 32 32"
                  className="text-white"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="white"
                    strokeWidth="2"
                    fill="currentColor"
                  />
                  <path
                    d="M16 10v8M16 22h.01"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div> */}
              <Image
                className="shrink-0 fill-synergy-light-blue mr-3 opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                loader={ImageLoader}
                width={Number(t(`blueBoxes.${i}.icon.width`))}
                height={Number(t(`blueBoxes.${i}.icon.height`))}
                src={t(`blueBoxes.${i}.icon.src`)}
                alt={t(`blueBoxes.${i}.icon.alt`)}
              />
              <div className="flex flex-col items-center">
                <div className="text-lg font-semibold text-white mb-1">
                  {t(`blueBoxes.${i}.title`)}
                </div>
                <div className="text-sm text-white/80 text-center">
                  {t(`blueBoxes.${i}.description`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Image
        loader={ImageLoader}
        src={t("image.src")}
        width={undefined}
        height={undefined}
        fill={true}
        className="object-cover object-[60%_100%] sm:object-[70%_100%] md:object-[70%_100%] lg:object-[50%_100%] xl:object-[40%_50%] 2xl:object-[60%_50%]"
        alt={t("image.alt")}
      />
      <div className="absolute inset-0 bg-black/20 lg:bg-transparent"></div>
    </div>
  );
};

export default HeroFull;
