"use client";
import {
  BentoGrid,
  BentoItem,
} from "@com.synergy/frontend-ui/BentoGridHeroLayout";
import { RotatingWord } from "../../shared/text/RotatingWord";
import Link from "next/link";
import { useMessages, useTranslations } from "next-intl";
import ServicesPopup from "./ServicesPopup";
import GlobeLocations from "./globe/GlobeLocations";

/* eslint-disable-next-line */
export interface BentoGridHeroProps {}

// BentoGridHero.tsx
// ------------------------------------------------------------
// A self‑contained demo page that shows a responsive, two‑column
// Bento Grid hero powered by SwiperJS. Each column has three rows;
// cards can span up to two columns and up to three rows.
// The grid scrolls horizontally one column at a time and loops
// indefinitely.  TailwindCSS is used for styling.
// BentoGridHero.tsx – v2
// One‑slide‑per‑view, always 2 columns × 3 rows.  Cards are packed
// into slides by area (colSpan * rowSpan ≤ 6) so nothing spills into
// extra rows.  TailwindCSS + SwiperJS + Next.js.
// ------------------------------------------------------------

export const BentoGridHero = (props: BentoGridHeroProps) => {
  const t = useTranslations("LandingPage.Home.BentoGridHero");
  const messages = useMessages();
  const heroMessages =
    (messages as any)?.LandingPage?.Home?.BentoGridHero || {};

  const heroItems = (heroMessages.items || {}) as Record<string, BentoItem>;
  const items: BentoItem[] = Object.keys(heroItems).map((key) => ({
    ...heroItems[key],
  }));

  const serviceLists: string[][] =
    (heroMessages.servicesCard?.lists as string[][]) || [];
  const locationLists: string[][] =
    (heroMessages.locationsCard?.lists as string[][]) || [];
  const productLists: string[][] =
    (heroMessages.productsCard?.lists as string[][]) || [];

  return (
    <div className="bg-white">
      <section className="w-full">
        <div className="max-w-7xl mx-auto min-[350px]:px-4 md:px-8 py-10 pt-20 xs:pt-28 md:pt-32">
          <header className="mb-4 md:mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wide text-gray-900 leading-tight">
              <span className="block">{t("title.main")}</span>
              <RotatingWord
                words={t.raw("title.rotating") as string[]}
                className="text-synergy-light-blue"
              />
            </h1>
            <h2 className="text-2xl md:text-3xl text-synergy-dark-grey text-slate-90 font-bold py-4 break-words hyphens-auto">
              {t("subtitle")}
            </h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Leistungen Box */}
            <div className="relative flex flex-col">
              <div
                className={`absolute inset-0 rounded-t-2xl rounded-br-[100px] mb-0 before:opacity-20 before:rounded-2xl before:absolute before:inset-0  before:bg-gradient-to-b before:from-synergy-light-blue before:to-synergy-light-blue/0 before:to-[100%] pointer-events-none`}
                aria-hidden="true"
              />
              <div className="relative z-10 h-48 m-1 overflow-hidden rounded-t-xl">
                {/* Echtes Projektfoto (Freiflächenanlage) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/projekte/startseite-leistungen.webp"
                  alt={t("servicesCard.imageAlt")}
                  className="absolute inset-0 w-full h-48 object-cover object-[50%_20%]"
                />
              </div>
              <div className="relative z-10 p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-black mb-4">
                  {t("servicesCard.title")}
                </h3>
                <div className="grid grid-cols-1 gap-x-6">
                  {serviceLists.map((list, columnIndex) => (
                    <ul
                      key={`services-column-${columnIndex}`}
                      className="text-black text-base mb-6 space-y-1"
                    >
                      {list.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-synergy-light-blue">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
                <Link
                  href={t("servicesCard.button.href")}
                  className="btn mt-6 md:mt-auto !rounded-[10px] backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue text-white group"
                >
                  <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                    {t("servicesCard.button.text")}
                    <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                      {/* {"->"} */}
                    </span>
                  </span>
                </Link>
              </div>
              {/* <div className="absolute inset-0 bg-synergy-light-grey z-0"></div> */}
            </div>
            {/* Produkte Box */}
            <div className="relative flex flex-col">
              <div
                className={`absolute inset-0 rounded-2xl mb-0 bg-gradient-to-b from-synergy-light-grey to-synergy-light-grey/0 to-[100%] pointer-events-none`}
                aria-hidden="true"
              />
              <div className="relative z-10 h-48 m-1 overflow-hidden rounded-t-xl">
                {/* Echtes Foto: PV-Terrassenüberdachung mit Glas-Glas-Modulen */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/projekte/startseite-zielgruppen.webp"
                  alt={t("productsCard.imageAlt")}
                  className="absolute inset-0 w-full h-48 object-cover object-[50%_45%]"
                />
              </div>
              <div className="relative z-10 p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-black mb-4">
                  {t("productsCard.title")}
                </h3>
                <div className="mb-6">
                  <div className="grid grid-cols-1 gap-x-6">
                    {productLists.map((list, columnIndex) => (
                      <ul
                        key={`products-column-${columnIndex}`}
                        className="text-black text-base space-y-1"
                      >
                        {list.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-synergy-light-blue">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>
                <Link
                  href={t("productsCard.button.href")}
                  className="btn mt-6 md:mt-auto !rounded-[10px] backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue text-white group"
                >
                  <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                    {t("productsCard.button.text")}
                    <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                      {/* {"->"} */}
                    </span>
                  </span>
                </Link>
                {/* <button
                  type="button"
                  className="btn mt-auto !rounded-[10px] backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue text-white group"
                  onClick={() => {
                    const dlg = document.getElementById(
                      "productsModal"
                    ) as HTMLDialogElement | null;
                    dlg?.showModal?.();
                    // disable page scrolling while modal is open
                    document.body.style.overflow = "hidden";
                  }}
                >
                  <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                    {t("productsCard.button.text")}
                  </span>
                </button>
                <ServicesPopup /> */}
              </div>
            </div>
            {/* Wo sind wir tätig – Globus mit Stecknadeln */}
            <div className="relative flex flex-col md:col-span-2 lg:col-span-1">
              <div
                className="absolute inset-0 rounded-2xl rounded-bl-[100px] mb-0 before:opacity-20 before:rounded-2xl before:absolute before:inset-0 before:bg-gradient-to-b before:from-synergy-light-blue before:to-synergy-light-blue/0 before:to-[100%] pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative z-10 h-48 m-1 flex items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-b from-white to-synergy-light-grey/40">
                <GlobeLocations
                  labels={{
                    austria: t("locationsCard.pins.austria"),
                    zambia: t("locationsCard.pins.zambia"),
                  }}
                  className="h-[11.5rem] w-[11.5rem] overflow-visible"
                />
              </div>
              <div className="relative z-10 p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-black mb-4">
                  {t("locationsCard.title")}
                </h3>
                {locationLists.map((list, columnIndex) => (
                  <ul
                    key={`locations-column-${columnIndex}`}
                    className="text-black text-base mb-6 space-y-1"
                  >
                    {list.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-synergy-light-blue">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
          {/* <BentoGrid items={items} autoplayDelay={5000} /> */}
        </div>
      </section>
    </div>
  );
};

export default BentoGridHero;
