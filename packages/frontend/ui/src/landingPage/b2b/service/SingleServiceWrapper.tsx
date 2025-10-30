"use client";

import { useMessages, useTranslations } from "next-intl";
import DiamondClips from "../../shared/ui/clips/DiamondClips";
import ServiceComponents from "./ServiceComponents";
import ServiceBackground from "./ServiceBackground";
import { useState } from "react";
import { AuroraText } from "../../shared/text/AuroraText";

/* eslint-disable-next-line */
export interface SingleServiceWrapperProps {
  service: string;
}

export const SingleServiceWrapper = (props: SingleServiceWrapperProps) => {
  const { service } = props;
  const t = useTranslations(`LandingPage.B2B.Services.${service}`);
  const messages: any = useMessages();
  const subServices = Object.keys(
    messages.LandingPage.B2B.Services[service].SubServices
  );
  const DiamondClipsArray = Object.keys(
    messages.LandingPage.B2B.Services[service].SubServices
  ).map((key) => ({
    subServiceId: key,
    src: t(`SubServices.${key}.Diamond.backgroundImage.src`),
    alt: t(`SubServices.${key}.Diamond.backgroundImage.alt`),
    text: t(`SubServices.${key}.Diamond.title`),
  }));

  const [selectedSubService, setSelectedSubService] = useState(subServices[0]);

  console.log("Selected SubService:", selectedSubService);

  return (
    <li className="mx-4 relative">
      <section className="scroll-mt-20" id={service}>
        <div className=" z-10 top-[3.5rem] pt-2 xs:pt-[4rem] grid gap-2 max-w-6xl mx-auto px-2 lg:px-0 rounded-b-xl bg-slate-50/90 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
          <div className="min-w-40 mb-12 w-full flex justify-center">
            <h3 className="flex items-center mb-1 text-4xl text-center font-bold text-gray-900 dark:text-white">
              <AuroraText>{t(`title`)}</AuroraText>
            </h3>
          </div>
          <div className="w-full max-w-6xl mx-auto">
            {/* Mobile/Tablet Grid Layout */}
            <div className="lg:hidden grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-6 p-2 md:p-4">
              {DiamondClipsArray.map(
                ({ subServiceId, src, alt, text }, idx) => (
                  <DiamondClips
                    key={subServiceId}
                    src={src}
                    alt={alt}
                    text={text}
                    index={idx}
                    numberServices={DiamondClipsArray.length}
                    subServiceId={subServiceId}
                    selectedSubService={selectedSubService}
                    setSelectedSubService={setSelectedSubService}
                    idx={idx}
                    service={service}
                  />
                )
              )}
            </div>

            {/* Desktop Diamond Layout */}
            <div className="hidden lg:flex lg:justify-center w-full">
              <div
                className="relative"
                style={{
                  // Use a fixed container width that can accommodate any diamond layout
                  width: "1000px", // Fixed width for consistent centering
                  height: (() => {
                    const diamondsPerRow = 4;
                    const diamondHeight = 160;
                    const verticalGap = 24;
                    const overlap = 0.7;
                    const numDiamonds = DiamondClipsArray.length;
                    const numRows = Math.ceil(numDiamonds / diamondsPerRow);
                    if (numRows === 0) return 0;

                    return (
                      diamondHeight +
                      (numRows - 1) * (diamondHeight * overlap + verticalGap)
                    );
                  })(),
                }}
              >
                {DiamondClipsArray.map(
                  ({ subServiceId, src, alt, text }, idx) => (
                    <DiamondClips
                      key={subServiceId}
                      src={src}
                      alt={alt}
                      text={text}
                      index={idx}
                      numberServices={DiamondClipsArray.length}
                      subServiceId={subServiceId}
                      selectedSubService={selectedSubService}
                      setSelectedSubService={setSelectedSubService}
                      idx={idx}
                      service={service}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
        <ServiceComponents
          translationService={service}
          translationSubService={selectedSubService}
        />
        <ServiceBackground
          translationService={service}
          translationSubService={selectedSubService}
        />
        {/* <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              Released on January 13th, 2022
            </time>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              Get access to over 20+ pages including a dashboard layout, charts,
              kanban board, calendar, and pre-order E-commerce & Marketing
              pages.
            </p> */}
        {/* <a
              href="#"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            >
              <svg
              className="w-3.5 h-3.5 me-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
              >
              <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
              <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>{" "}
              Download ZIP
            </a> */}
      </section>
    </li>
  );
};

export default SingleServiceWrapper;
