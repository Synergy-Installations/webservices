"use client";
import {
  BentoGrid,
  BentoItem,
} from "@com.synergy/frontend-ui/BentoGridHeroLayout";
import { AuroraText } from "../../shared/text/AuroraText";
import { div } from "framer-motion/client";
import ImageLoader from "../../../shared/utils/image/ImageLoader";
import Image from "next/image";
import Link from "next/link";
import ServicesPopup from "./ServicesPopup";

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
  const items: BentoItem[] = [
    {
      id: "pv",
      title: "Photovoltaik & Stromspeicher",
      description: "Strom direkt vom Dach",
      image: "/frontend/landingPage/products/AA%20Dach-montage.jpg",
      rowSpan: 3,
      button: {
        link: "/products#photovoltaic",
        text: "Hier Photovoltaik sichern",
      },
    },
    {
      id: "heat",
      title: "Wärmepumpen",
      image: "/frontend/landingPage/products/heat-pump-orange.jpg",
      rowSpanSm: 2,
      button: {
        link: "/products#heat-pump",
        text: "Hier Wärmepumpe sichern",
      },
    },
    {
      id: "ac",
      title: "Klimasysteme",
      image:
        "/frontend/landingPage/products/close-up-shot-of-air-conditioner-hanging-on-white-2024-11-19-02-00-43-utc.jpeg",
      rowSpanSm: 2,
      button: {
        link: "/products#air-conditioning",
        text: "Hier Klimasystem sichern",
      },
    },
    {
      id: "smart-home",
      title: "Smart Home",
      image: "/frontend/landingPage/products/AA%20Smart%20Home.jpeg",
      button: {
        link: "/products#smart-home",
        text: "Mehr erfahren",
      },
    },
    {
      id: "energiegemeinschaften",
      title: "Energiegemeinschaften",
      image: "/frontend/landingPage/products/AdobeStock_562132787.jpeg",
      button: {
        link: "/focus/energiegemeinschaft",
        text: "Mehr erfahren",
      },
    },
    {
      id: "stromtankstelle",
      title: "Stromtankstelle",
      image:
        "/frontend/landingPage/products/AA%20Wallbox%20AdobeStock_762399295.jpeg",
      button: {
        link: "/products#wallbox",
        text: "Mehr erfahren",
      },
    },
    {
      id: "notstrom",
      title: "Notstrom Versorgung",
      image: "/frontend/landingPage/products/notstromversorgung.svg",
      button: {
        link: "/focus/notstromversorgung",
        text: "Mehr erfahren",
      },
    },
    {
      id: "balkonkraftwerk",
      title: "Balkonkraftwerk",
      image: "/frontend/landingPage/focus/Heat-Pump/Balkonkraftwerk.jpg",
      button: {
        link: "/focus/balkonkraftwerk",
        text: "Mehr erfahren",
      },
    },
    {
      id: "energiekosten-beratung",
      title: "Energiekosten-Beratung",
      image:
        "/frontend/landingPage/products/a-hand-holding-the-electricity-bill-and-euro-bankn-2025-03-13-01-30-07-utc.jpeg",
      button: {
        link: "/focus/energiekostenberatung",
        text: "Mehr erfahren",
      },
    },
    {
      id: "warmwasser",
      title: "Autarke Warmwasser-Erzeugung",
      image:
        "/frontend/landingPage/products/boiling-water-splash-with-steam-on-black-backgroun-2025-03-13-11-28-22-utc.jpeg",
      button: {
        link: "/focus/autarke-warmwasser-erzeugung",
        text: "Mehr erfahren",
      },
    },
    {
      id: "wartung-service",
      title: "Wartung & Service",
      image:
        "/frontend/landingPage/products/certified-male-electrician-installing-home-ev-char-2024-10-18-05-46-25-utc.jpeg",
      button: {
        link: "/focus/wartung-service",
        text: "Mehr erfahren",
      },
    },
  ];

  return (
    <div className="bg-white">
      <section className="w-full">
        <div className="max-w-7xl mx-auto min-[350px]:px-4 md:px-8 py-10 pt-20 xs:pt-28 md:pt-32">
          <header className="mb-4 md:mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-normal">
              Innovative <AuroraText>Synergielösungen</AuroraText>{" "}
              <div className="block sm:hidden"></div> für Ihr Energiesystem
            </h1>
            <h2 className="text-2xl md:text-3xl text-synergy-dark-grey text-slate-90 font-bold py-4 break-words hyphens-auto">
              Ihr Anbieter für ganzheitliche Energielösungen
            </h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Leistungen Box */}
            <div className="relative flex flex-col">
              <div
                className={`absolute inset-0 rounded-t-2xl rounded-br-[100px] mb-0 before:opacity-20 before:rounded-2xl before:absolute before:inset-0  before:bg-gradient-to-b before:from-synergy-light-blue before:to-synergy-light-blue/0 before:to-[100%] pointer-events-none`}
                aria-hidden="true"
              />
              <div className="relative z-10 h-48 m-1 overflow-hidden rounded-t-xl">
                <Image
                  src="/frontend/landingPage/Hero/ChatGPT%20Image%20Oct%2031%2C%202025%20at%2010_55_18%20PM.jpg"
                  alt="Leistungen Symbolbild"
                  loader={ImageLoader}
                  className="w-full h-48 object-cover scale-[115%] object-[50%,60%]"
                  fill
                />
              </div>
              <div className="relative z-10 p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-black mb-4">
                  Leistungen
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <ul className="text-black text-base mb-6 space-y-1 list-disc list-inside">
                    <li>Beratung</li>
                    <li>Marketing</li>
                  </ul>
                  <ul className="text-black text-base mb-6 space-y-1 list-disc list-inside">
                    <li>Service</li>
                    <li>Umsetzung</li>
                  </ul>
                </div>
                <Link
                  href={"/leistungen"}
                  className="btn mt-6 md:mt-auto !rounded-[10px] backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue text-white group"
                >
                  <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                    Details anzeigen
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
                <Image
                  src="/frontend/landingPage/Hero/handyman_products_v2.jpg"
                  alt="Produkte Symbolbild"
                  loader={ImageLoader}
                  className="w-full h-48 object-cover object-[50%,10%]"
                  fill
                />
              </div>
              <div className="relative z-10 p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-black mb-4">Produkte</h3>
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <ul className="text-black text-base space-y-1 list-disc list-inside">
                      <li>PV-Anlage</li>
                      <li>Stromspeicher</li>
                      <li>Wärmepumpe</li>
                      <li>Klimaanlage</li>
                      <li>Energiegemeinschaft</li>
                      <li>Smart Home</li>
                    </ul>
                    <ul className="text-black text-base space-y-1 list-disc list-inside">
                      <li>Strom Tankstelle (Wallbox)</li>
                      <li>Notstromversorgung</li>
                      <li>Balkonkraftwerk</li>
                      <li>Energiekostenberatung</li>
                      <li>Autarke Warmwasser Erzeugung</li>
                      <li>Wartung &amp; Service</li>
                    </ul>
                  </div>
                </div>
                <button
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
                    Details anzeigen
                  </span>
                </button>
                <ServicesPopup />
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
