"use client";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { ProductPreviewSmall } from "@com.synergy/frontend-ui/ProductPreviewSmall";
import { useMessages, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

/* eslint-disable-next-line */
export interface HeroVideoFullProps {}

export const HeroVideoFull = (props: HeroVideoFullProps) => {
  const t = useTranslations("LandingPage.Products.HeroVideo");

  const videoRef = useRef<HTMLVideoElement>(null);

  const messages: any = useMessages();
  const productPreviewKeys = Object.keys(
    messages?.LandingPage?.Products?.HeroVideo?.productPreviewSmall || {}
  );

  const playVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.error("Error playing video:" + error);
      });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && window) {
      // Internet Explorer 6-11
      /** @ts-ignore */
      const isIE = /*@cc_on!@*/ false || !!document.documentMode;

      // Edge 20+
      // Edge does not get recognized correctly, however, the video plays as expected
      const isEdge = !isIE && !!window.StyleMedia;

      // Firefox 1.0+
      /**@ts-ignore */
      const isFirefox = typeof InstallTrigger !== "undefined";

      if (!isEdge && !isFirefox) {
        video.playsInline = true;
        video.play().catch((error) => {
          console.error("Error playing video:" + error);
        });
      }
    }
  }, [videoRef]);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <video
        width="full"
        height="full"
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        autoPlay
        preload="metadata"
        ref={videoRef}
      >
        <source
          src={t(`video.h264.src`)}
          type='video/mp4; codecs="avc1.42E01E"'
        />
        <source src={t(`video.h265.src`)} type='video/mp4; codecs="hev1"' />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-20 container mx-auto px-6 lg:px-8 pt-0 pb-12 flex flex-col justify-center items-start min-h-[100svh] text-white space-y-4">
        <p className="uppercase tracking-widest font-semibold text-sm lg:text-base">
          {t("eyebrow")}
        </p>
        <h1
          onClick={() => playVideo()}
          className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight"
        >
          {t("title")}
        </h1>
        <h2 className="text-lg md:text-2xl font-medium">
          {t("subtitle")}
        </h2>
        <p className="max-w-2xl text-sm md:text-base">
          {t("body")}
        </p>
        <div className="flex flex-col sm:flex-col-reverse justify-start items-center md:items-start w-full sm:w-auto">
          {/* {productPreviewKeys.length > 0 && (
            <div className="grid grid-cols-2 sm:mt-12 gap-2 sm:gap-5 w-full">
              {productPreviewKeys.map((productPreviewKey, index) => (
                <ProductPreviewSmall
                  name={t(`productPreviewSmall.${productPreviewKey}.title`)}
                  href={t(`productPreviewSmall.${productPreviewKey}.href`)}
                  image={{
                    src: t(
                      `productPreviewSmall.${productPreviewKey}.image.src`
                    ),
                    alt: t(
                      `productPreviewSmall.${productPreviewKey}.image.alt`
                    ),
                    className: "hidden sm:block",
                    type: "picture",
                  }}
                  className="!w-full text-lg sm:p-1 sm:!pr-0 sm:text-2xl justify-center sm:justify-start min-h-[63px] sm:min-h-min"
                  key={index}
                />
              ))}
            </div>
          )} */}
          <div className="relative mx-auto grid xs:flex gap-4 sm:mx-0 sm:w-fit mt-12 sm:mt-6 before:hidden before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
            <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center items-center">
              <Link
                className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line flex items-center justify-center h-full"
                href={t("buttonLeft.href")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line justify-center">
                  {t("buttonLeft.text")}
                  <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    <div className=" whitespace-nowrap">{"->"}</div>
                  </div>
                </span>
              </Link>
            </div>
            <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Link
                className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line"
                href={t("buttonRight.href")}
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line">
                  {t("buttonRight.text")}
                  <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    <div className=" whitespace-nowrap">{"->"}</div>
                  </div>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroVideoFull;
