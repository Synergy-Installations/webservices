"use client";

import { useMessages, useTranslations } from "next-intl";
import DiamondClips from "../../shared/ui/clips/DiamondClips";
import ServiceComponents from "./ServiceComponents";
import ServiceBackground from "./ServiceBackground";
import { useState } from "react";

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
        <div className="sticky z-10 top-[3.5rem] pt-2 xs:pt-[4rem] grid lg:flex items-center gap-2 px-2 rounded-b-xl bg-slate-50/90 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
          <div className="min-w-40">
            <span className="absolute flex items-center justify-center ms-2 w-6 h-6 bg-blue-100 rounded-full -start-9 ring-8 ring-slate-50 dark:ring-gray-900 dark:bg-blue-900">
              <svg
                className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
              </svg>
            </span>
            <h3 className="flex items-center mb-1 text-lg font-bold text-gray-900 dark:text-white">
              {t(`title`)}{" "}
              {/* <span className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300 ms-3">
                Latest
                </span> */}
            </h3>
          </div>
          <div className="w-full max-w-6xl mx-auto">
            <div
              className="relative p-2 md:p-4 max-w-5xl mx-auto w-full bg-transparent rounded-xl
              grid grid-cols-2 sm:grid-cols-3 gap-6
              lg:block"
              style={{
                position: "relative",
                height: (() => {
                  if (window.innerWidth <= 1024) return "unset";
                  // Calculate number of rows
                  const diamondsPerRow = 4;
                  const diamondHeight = 160; // px
                  const verticalGap = 24; // px
                  const overlap = 0.7; // 0.7 to account for diamond overlap
                  const numDiamonds = DiamondClipsArray.length;
                  const numRows = Math.ceil(numDiamonds / diamondsPerRow);
                  if (numRows === 0) return 0;
                  // Each row after the first is offset by (diamondHeight * overlap + verticalGap)
                  // Total height = first row + (numRows - 1) * (diamondHeight * overlap + verticalGap)
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
