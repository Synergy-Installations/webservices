"use client";
import {
  BentoGrid,
  BentoItem,
} from "@com.synergy/frontend-ui/BentoGridHeroLayout";
import { AuroraText } from "../../shared/text/AuroraText";

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
      title: "Photovoltaik",
      description: "Strom direkt vom Dach",
      image:
        "/frontend/landingPage/FeatureAdvantages/Money_coins_electronics.jpg",
      rowSpan: 3,
      button: {
        link: "/products#phtovoltaic",
        text: "Hier Photovoltaik sichern",
      },
    },
    {
      id: "heat",
      title: "Wärmepumpen",
      image:
        "/frontend/landingPage/FeatureAdvantages/Money_coins_electronics.jpg",
      button: {
        link: "/products#phtovoltaic",
        text: "Hier Photovoltaik sichern",
      },
    },
    {
      id: "ac",
      title: "Klimaanlagen",
      image:
        "/frontend/landingPage/FeatureAdvantages/Money_coins_electronics.jpg",
      button: {
        link: "/products#phtovoltaic",
        text: "Hier Photovoltaik sichern",
      },
    },

    // The previous slide is now full (3×1 + 1×1 + 2×1 = 6)
    {
      id: "wallbox",
      title: "Wallbox‑Lösungen",
      image:
        "/frontend/landingPage/FeatureAdvantages/Money_coins_electronics.jpg",
      button: {
        link: "/products#phtovoltaic",
        text: "Hier Photovoltaik sichern",
      },
      colSpan: 1,
    },
    {
      id: "smart",
      title: "Smart Home",
      image:
        "/frontend/landingPage/FeatureAdvantages/Money_coins_electronics.jpg",
      button: {
        link: "/products#phtovoltaic",
        text: "Hier Photovoltaik sichern",
      },
      rowSpan: 2,
    },
    {
      id: "storage",
      title: "Stromspeicher",
      image:
        "/frontend/landingPage/FeatureAdvantages/Money_coins_electronics.jpg",
      button: {
        link: "/products#phtovoltaic",
        text: "Hier Photovoltaik sichern",
      },
    },
  ];

  return (
    <section className="w-full bg-synergy-light-blue/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pt-32">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Innovative <AuroraText>Energielösungen</AuroraText> für Ihr Zuhause
          </h1>
        </header>
        <BentoGrid items={items} autoplayDelay={5000} />
      </div>
    </section>
  );
};

export default BentoGridHero;
