"use client";
import {
  BentoGrid,
  BentoItem,
} from "@com.synergy/frontend-ui/BentoGridHeroLayout";
import { AuroraText } from "../../shared/text/AuroraText";
import { div } from "framer-motion/client";

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
      <section className="w-full bg-synergy-light-blue bg-opacity-[0.13]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pt-32">
          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Innovative <AuroraText>Synergielösungen</AuroraText> für Ihr
              Zuhause
            </h1>
          </header>
          <BentoGrid items={items} autoplayDelay={5000} />
        </div>
      </section>
    </div>
  );
};

export default BentoGridHero;
