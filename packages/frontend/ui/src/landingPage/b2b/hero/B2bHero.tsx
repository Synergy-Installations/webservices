import { useMessages, useTranslations } from "next-intl";
import Link from "next/link";
import ProductPreviewSmall from "../../../shared/ui/products/ProductPreviewSmall";

/* eslint-disable-next-line */
export interface B2bHeroProps {}

export const B2bHero = (props: B2bHeroProps) => {
  const t = useTranslations("LandingPage.B2B");
  const messages: any = useMessages();
  const productPreviewKeys = Object.keys(
    messages.LandingPage.B2B.productPreviewSmall
  );

  return (
    <section
      className="relative min-h-[100svh] pt-48 pb-12 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/b2b/666b6046a608f39e0d981657_AdobeStock_487289470.webp')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <div className="relative container mx-auto px-6 lg:px-0 flex flex-col justify-end items-start h-full text-white space-y-4">
        <p className="uppercase tracking-widest font-semibold text-sm lg:text-base">
          Dienstleistungen
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Services für Betriebe aus dem Energiesektor
        </h1>
        <h2 className="text-lg md:text-2xl font-medium">
          Seien Sie ein Vorreiter in der Anlagenerrichtung
        </h2>
        <p className="max-w-2xl text-sm md:text-base">
          Mit der Expertise unserer firmeninternen Fachkräfte aus den
          unterschiedlichsten Gewerken helfen wir Ihnen dabei, Ihre
          Dienstleistungen in der Anlagenerrichtung voranzutreiben als auch Ihre
          derzeitigen Prozesse zu optimieren.
        </p>
        <div className="flex flex-col sm:flex-col-reverse justify-start items-center md:items-start w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:mt-12 gap-2 sm:gap-5 w-full">
            {productPreviewKeys.map((productPreviewKey, index) => (
              <ProductPreviewSmall
                name={t(`productPreviewSmall.${productPreviewKey}.title`)}
                href={t(`productPreviewSmall.${productPreviewKey}.href`)}
                image={{
                  src: t(`productPreviewSmall.${productPreviewKey}.image.src`),
                  alt: t(`productPreviewSmall.${productPreviewKey}.image.alt`),
                  className: "hidden sm:block",
                  type: "icon",
                }}
                className="!w-full text-lg sm:p-1 sm:!pr-0 sm:text-2xl justify-center sm:justify-start min-h-[63px] sm:min-h-min"
                key={index}
              />
            ))}
          </div>
          <div className="relative mx-auto grid xs:flex gap-4 sm:mx-0 sm:w-fit mt-12 sm:mt-6 before:hidden before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
            <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center items-center">
              <Link
                className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line flex items-center justify-center h-full"
                href={"/kontakt"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line justify-center">
                  Kontakt
                  <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    <div className=" whitespace-nowrap">{"->"}</div>
                  </div>
                </span>
              </Link>
            </div>
            <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Link
                className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line"
                href={"/contact-us-funnel"}
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line">
                  Buchen Sie Ihre PV Montage
                  <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    <div className=" whitespace-nowrap">{"->"}</div>
                  </div>
                </span>
              </Link>
            </div>
          </div>
        </div>
        {/* <Link href="#contact">
          <p className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-md transition">
            Kontakt aufnehmen
          </p>
        </Link> */}
      </div>
    </section>
  );
};

export default B2bHero;
