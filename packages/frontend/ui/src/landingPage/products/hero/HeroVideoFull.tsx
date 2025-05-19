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
    messages.LandingPage.Products.HeroVideo.productPreviewSmall
  );

  const heroVideoCodecKeys = Object.keys(
    messages.LandingPage.Products.HeroVideo.video
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
          alert("Error playing video:" + error);
        });
      }
    }
  }, [videoRef]);

  return (
    <div className="relative w-svw min-h-[100svh]">
      <div className="relative z-20 h-full min-h-[893px] flex flex-col items-center justify-center py-12 lg:block lg:pt-[280px] lg:pl-[140px] w-auto">
        {/* <h1 className="text-white text-7xl font-bold">Produkte</h1> */}
        <h1
          onClick={() => playVideo()}
          className="mb-6 py-2 border-y text-5xl [text-shadow:_3px_3px_5px_rgb(0_0_0_/_40%)] font-bold w-fit text-white text-center [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-6xl"
        >
          {t("title")}
        </h1>
        <div className="flex flex-col sm:flex-col-reverse justify-start items-center sm:items-start">
          <div className="grid grid-cols-2 sm:mt-12 gap-2 sm:gap-5">
            {productPreviewKeys.map((productPreviewKey, index) => (
              <ProductPreviewSmall
                name={t(`productPreviewSmall.${productPreviewKey}.title`)}
                href={t(`productPreviewSmall.${productPreviewKey}.href`)}
                image={{
                  src: t(`productPreviewSmall.${productPreviewKey}.image.src`),
                  alt: t(`productPreviewSmall.${productPreviewKey}.image.alt`),
                  className: "hidden sm:block",
                }}
                className="w-full text-lg p-4 !pr-4 sm:p-1 sm:!pr-6 sm:text-2xl justify-center sm:justify-start min-h-[63px] sm:min-h-min"
                key={index}
              />
            ))}
          </div>
          <div className="relative mx-auto grid xs:flex gap-4 lg:mx-0 sm:w-fit mt-12 sm:mt-0 before:hidden before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
            <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Link
                className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto"
                href={t("buttonLeft.href")}
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                  {t("buttonLeft.text")}
                  <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    {"->"}
                  </span>
                </span>
              </Link>
            </div>
            <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Link
                className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto"
                href={t("buttonRight.href")}
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                  {t("buttonRight.text")}
                  <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    {"->"}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <video
        width="full"
        height="full"
        className="absolute inset-0 w-full h-full object-cover rounded-bl-[100px]"
        loop
        muted
        autoPlay
        // webkit-playsinline={true}
        // playsInline
        preload="metadata"
        ref={videoRef}
      >
        <source
          src={t(`video.h264.src`)}
          type='video/mp4; codecs="avc1.42E01E"'
        />
        <source src={t(`video.h265.src`)} type='video/mp4; codecs="hev1"' />
        {/* {heroVideoCodecKeys.map((heroVideoCodecKey, index) => (
          <>
            <source
              key={index}
              src={t(`video.${heroVideoCodecKey}.src`)}
              type={`${t(`video.${heroVideoCodecKey}.codec`)}`}
            />
          </>
        ))} */}
        {/* <source src="h265.mp4" type='video/mp4; codecs="hev1"' />
        <source src="h264.mp4" type='video/mp4; codecs="avc1.42E01E"' />
        <source src={t("video.src")} type="video/mp4" /> */}
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default HeroVideoFull;
