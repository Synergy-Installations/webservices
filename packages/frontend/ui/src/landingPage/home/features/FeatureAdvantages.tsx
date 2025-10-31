"use client";

import { useState } from "react";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import { Stats } from "@com.synergy/frontend-ui/Stats";
import RichText from "../../../shared/internationalization/text/RichText";

/* eslint-disable-next-line */
export interface FeatureAdvantagesProps {}

export const FeatureAdvantages = (props: FeatureAdvantagesProps) => {
  const [tab, setTab] = useState<number>(0);

  const t = useTranslations("LandingPage.Home.FeatureAdvantages");

  const messages: any = useMessages();
  const buttonKeys = Object.keys(
    messages.LandingPage.Home.FeatureAdvantages.buttons
  );
  const blockKeys = Object.keys(
    messages.LandingPage.Home.FeatureAdvantages.blocks
  );
  const blueBoxes = Object.keys(messages.LandingPage.Home.Hero.blueBoxes);

  return (
    <section className="relative rounded-t-[100px] bg-synergy-light-grey after:absolute after:top-0 after:right-0 after:h-full after:w-96 after:pointer-events-none after:bg-gradient-to-l after:from-synergy-light-grey/0 max-lg:after:hidden">
      <div className="py-12 md:py-20">
        {/* Carousel */}
        {/* Clarified container max width: max-w-6xl, centered */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          {/* Two equal columns: left content and right image each take 50% of the container on lg+.
          Use grid so columns are exact halves and give both columns the same horizontal inner padding
          so the left space beside the left content equals the right space beside the right image. */}
          <div className="mx-auto w-full space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-x-12">
            {/* Content (left) - half width on lg+. Add same horizontal padding as the right column */}
            <div className="w-full flex-shrink-0 px-4 lg:px-6">
              <div className="mb-8">
                <div className="flex justify-center">
                  <div className="inline-flex text-sm font-medium px-4 py-0.5 text-white border border-transparent backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue rounded-full mb-4">
                    {t("pill")}
                  </div>
                </div>
                <h3 className="font-inter-tight text-3xl text-center font-bold text-synergy-dark-grey mb-4">
                  {t("title")}
                </h3>
                <div className="text-lg text-center text-synergy-dark-grey">
                  <RichText>{(tags) => t.rich("description", tags)}</RichText>
                </div>
              </div>

              {/* Tabs buttons - keep these inside the left column */}
              <div className="mb-8 md:mb-0 space-y-2">
                {buttonKeys.map((key, index) => (
                  <button
                    key={index}
                    className={`relative text-left flex items-center px-6 py-4 rounded-lg border border-transparent w-full ${tab !== index ? "" : "before:opacity-20 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl"}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setTab(index);
                    }}
                  >
                    <Image
                      className="shrink-0 fill-synergy-light-blue mr-3 opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      loader={ImageLoader}
                      width={Number(t(`buttons.${key}.buttonIcon.width`))}
                      height={Number(t(`buttons.${key}.buttonIcon.height`))}
                      src={t(`buttons.${key}.buttonIcon.src`)}
                      alt={t(`buttons.${key}.buttonIcon.alt`)}
                    />
                    <div>
                      <div className="font-inter-tight text-lg font-semibold text-synergy-dark-grey mb-1">
                        {t(`buttons.${key}.text`)}
                      </div>
                      <div className="text-synergy-dark-grey">
                        {t(`buttons.${key}.description`)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs items (right) - half width on lg+. Add same horizontal padding as left. */}
            <div className="relative w-full flex-shrink-0 flex items-stretch px-2 lg:px-6">
              <div className="relative flex flex-col h-full w-full">
                {/* Items */}
                {buttonKeys.map((key, index) => (
                  <Transition show={tab === index} key={index}>
                    <div className="relative transition h-full ease-in-out data-[closed]:opacity-0 data-[enter]:duration-700 data-[enter]:data-[closed]:translate-x-8 data-[closed]:absolute data-[leave]:duration-300 data-[leave]:data-[closed]:-translate-x-8 w-full">
                      {/* wrapper ensures no overflow; horizontal padding is provided by the column (px-4 lg:px-6)
                so left/right outer spacing is symmetric. The inner wrapper has no extra horizontal padding
                to avoid creating asymmetry. Image fills available height and has no border. */}
                      <div className="overflow-hidden rounded-xl bg-transparent max-w-full h-full box-border">
                        <Image
                          className="w-full h-full object-cover block border-0"
                          loader={ImageLoader}
                          width={0}
                          height={Number(t(`buttons.${key}.image.height`))}
                          src={t(`buttons.${key}.image.src`)}
                          alt={t(`buttons.${key}.image.alt`)}
                          style={{
                            objectPosition: t(
                              `buttons.${key}.image.objectPosition`
                            ) as any,
                          }}
                        />
                      </div>
                    </div>
                  </Transition>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features blocks */}
        <div className="max-w-6xl mx-auto mt-12 lg:mt-32">
          <Stats />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* Blocks */}
            {/* {blockKeys.map((key, index) => (
          <div key={index}>
          <div className="flex items-center mb-1">
            <Image
            className="shrink-0 fill-synergy-light-blue mr-2 opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
            loader={ImageLoader}
            width={Number(t(`blocks.${key}.icon.width`))}
            height={Number(t(`blocks.${key}.icon.height`))}
            src={t(`blocks.${key}.icon.src`)}
            alt={t(`blocks.${key}.icon.alt`)}
            />
            <h3 className="font-inter-tight font-semibold text-synergy-dark-grey">
            {t(`blocks.${key}.title`)}
            </h3>
          </div>
          <p className="text-sm text-synergy-dark-grey">
            {t(`blocks.${key}.description`)}
          </p>
          </div>
        ))} */}
          </div>
        </div>

        {/* Blue boxes at the bottom center */}
        <div className="relative flex flex-wrap items-stretch justify-center py-6 gap-6 mt-4 z-20">
          {blueBoxes.map((i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-start gap-2 px-6 py-4 rounded-2xl bg-synergy-light-blue/70 backdrop-blur-md shadow-lg min-w-[220px] max-w-[260px] w-full sm:w-[48%] md:w-[31%] lg:w-[22%] xl:w-[18%]"
            >
              <Image
                className="shrink-0 fill-synergy-light-blue mr-3 opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                loader={ImageLoader}
                width={Number(t(`blueBoxes.${i}.icon.width`))}
                height={Number(t(`blueBoxes.${i}.icon.height`))}
                src={t(`blueBoxes.${i}.icon.src`)}
                alt={t(`blueBoxes.${i}.icon.alt`)}
              />
              <div className="flex flex-col items-center">
                <div className="text-lg font-semibold text-white mb-1 text-center">
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
    </section>
  );
};

export default FeatureAdvantages;
