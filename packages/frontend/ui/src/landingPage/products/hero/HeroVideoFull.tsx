import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { ProductPreviewSmall } from "@com.synergy/frontend-ui/ProductPreviewSmall";
import { useMessages, useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface HeroVideoFullProps {}

export const HeroVideoFull = (props: HeroVideoFullProps) => {
  const t = useTranslations("LandingPage.Products.HeroVideo");

  const messages: any = useMessages();
  const productPreviewKeys = Object.keys(
    messages.LandingPage.Products.HeroVideo.productPreviewSmall
  );

  return (
    <div className="relative w-svw h-[100svh] min-h-[893px]">
      <div className="relative z-20 h-full flex flex-col items-center justify-center lg:block lg:pt-[340px] lg:pl-[140px] w-auto">
        {/* <h1 className="text-white text-7xl font-bold">Produkte</h1> */}
        <h1 className="mb-6 mt-5 border-y text-5xl [text-shadow:_3px_3px_5px_rgb(0_0_0_/_40%)] font-bold w-fit text-white text-center [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-6xl">
          {t("title")}
        </h1>
        <div className="relative w-fit mt-12 before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
          <div
            className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
            data-aos="zoom-y-out"
            data-aos-delay={450}
          >
            <Link
              className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto"
              href={t("button.href")}
            >
              <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                {t("button.text")}
                <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                  {"->"}
                </span>
              </span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 w-fit mt-9 gap-5">
          {productPreviewKeys.map((productPreviewKey, index) => (
            <ProductPreviewSmall
              name={t(`productPreviewSmall.${productPreviewKey}.title`)}
              image={{
                src: t(`productPreviewSmall.${productPreviewKey}.image.src`),
                alt: t(`productPreviewSmall.${productPreviewKey}.image.alt`),
              }}
              className="w-full"
              key={index}
            />
          ))}
        </div>
      </div>
      <video
        width="full"
        height="full"
        className="absolute inset-0 w-full h-full object-cover rounded-bl-[100px]"
        loop
        muted
        autoPlay
        webkit-playsinline="true"
        playsInline
      >
        <source
          src={t("video.src")}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default HeroVideoFull;
