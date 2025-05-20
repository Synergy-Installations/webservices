"use client";

import { useState } from "react";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import { Stats } from "@com.synergy/frontend-ui/Stats";

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

  return (
    <section className="relative rounded-tl-[100px] bg-synergy-light-grey after:absolute after:top-0 after:right-0 after:h-full after:w-96 after:pointer-events-none after:bg-gradient-to-l after:from-synergy-light-grey/0 max-lg:after:hidden">
      <div className="py-12 md:py-20">
        {/* Carousel */}
        <div className="max-w-xl lg:max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lg:flex space-y-12 lg:space-y-0 lg:space-x-12 xl:space-x-24">
            {/* Content */}
            <div className="lg:max-w-none lg:min-w-[524px]">
              <div className="mb-8">
                <div className="inline-flex text-sm font-medium px-4 py-0.5 text-white border border-transparent backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue rounded-full mb-4">
                  {t("pill")}
                </div>
                <h3 className="font-inter-tight text-3xl font-bold text-synergy-dark-grey mb-4">
                  {t("title")}
                </h3>
                <p className="text-lg text-synergy-dark-grey">
                  {t("description")}
                </p>
              </div>
              {/* Tabs buttons */}
              <div className="mb-8 md:mb-0 space-y-2">
                {buttonKeys.map((key, index) => (
                  <button
                    key={index}
                    className={`relative text-left flex items-center px-6 py-4 rounded border border-transparent ${tab !== index ? "" : "before:opacity-20 before:absolute before:inset-0 before:rounded before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl"}`}
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

            {/* Tabs items */}
            <div className="relative lg:max-w-none">
              <div className="relative flex flex-col">
                {/* Items */}
                {buttonKeys.map((key, index) => (
                  <Transition show={tab === index} key={index}>
                    <div className="transition ease-in-out data-[closed]:opacity-0 data-[enter]:duration-700 data-[enter]:data-[closed]:translate-x-8 data-[closed]:absolute data-[leave]:duration-300 data-[leave]:data-[closed]:-translate-x-8">
                      <Image
                        className="lg:max-w-none mx-auto rounded-lg shadow-2xl object-cover"
                        loader={ImageLoader}
                        width={Number(t(`buttons.${key}.image.width`))}
                        height={Number(t(`buttons.${key}.image.height`))}
                        src={t(`buttons.${key}.image.src`)}
                        alt={t(`buttons.${key}.image.alt`)}
                      />
                    </div>
                  </Transition>
                ))}
              </div>
              {/* Gear illustration */}
              {buttonKeys.map((key, index) => (
                <Transition show={tab === index} key={index}>
                  <div className="absolute left-0 bottom-0 sm:-translate-x-1/2 translate-y-1/2 sm:translate-y-1/2 bg-[#333333]/60 backdrop-blur-sm p-6 sm:p-12 rounded-3xl sm:rounded-[56px] transition ease-in-out data-[closed]:opacity-0 data-[enter]:duration-700 data-[enter]:data-[closed]:translate-x-8 data-[closed]:absolute data-[leave]:duration-300 data-[leave]:data-[closed]:-translate-x-8">
                    <Image
                      className="w-min h-[40px] lg:h-[101px] object-fill"
                      loader={ImageLoader}
                      width={Number(t(`buttons.${key}.imageIcon.width`))}
                      height={Number(t(`buttons.${key}.imageIcon.height`))}
                      src={t(`buttons.${key}.imageIcon.src`)}
                      alt={t(`buttons.${key}.imageIcon.alt`)}
                      aria-hidden="true"
                    />
                  </div>
                </Transition>
              ))}
            </div>
          </div>
        </div>

        {/* Features blocks */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-24 lg:mt-32">
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
      </div>
    </section>
  );
};

export default FeatureAdvantages;
