import type { Metadata } from "next";

/**
 * Titel und Beschreibungen für Google, KI-Suchen und Link-Vorschauen
 * (LinkedIn, WhatsApp …). Hier zentral gepflegt, je Sprache.
 */
type Lang = "de" | "en";
type PageKey =
  | "home"
  | "leistungen"
  | "ueberUns"
  | "kontakt"
  | "montageBuchen"
  | "impressum"
  | "datenschutz"
  | "nutzungsbedingungen";

const SITE = {
  de: {
    title:
      "Photovoltaik Projektumsetzung & PV-Montage für Fachbetriebe | SYNERGIE",
    description:
      "Ihr Montagepartner für Photovoltaik: Beratung & Engineering, Umsetzung und Anlagenservice für EPC, Haustechnik- und Elektrobetriebe, Betreiber, Hausverwaltungen und Immobilienentwickler – flexibel, schnell, unkompliziert.",
    keywords: [
      "Photovoltaik Montage",
      "PV-Montage",
      "PV Montagepartner",
      "Photovoltaik Projektumsetzung",
      "EPC Photovoltaik",
      "Freiflächenanlage Montage",
      "PV Engineering",
      "Anlagenservice Photovoltaik",
      "Photovoltaik Österreich",
      "Photovoltaik Niederösterreich",
      "SYNERGIE Montagen Riegler",
    ],
    ogLocale: "de_AT",
  },
  en: {
    title:
      "Photovoltaic Project Delivery & PV Installation for Contractors | SYNERGIE",
    description:
      "Your installation partner for photovoltaics: consulting & engineering, implementation and system service for EPCs, building services and electrical contractors, operators, property managers and developers – flexible, fast, uncomplicated.",
    keywords: [
      "PV installation",
      "photovoltaic installation partner",
      "solar EPC subcontractor",
      "ground-mounted PV installation",
      "PV engineering",
      "PV operation and maintenance",
      "photovoltaics Austria",
      "SYNERGIE Montagen Riegler",
    ],
    ogLocale: "en_GB",
  },
} as const;

const PAGES: Record<
  PageKey,
  Record<Lang, { title: string; description: string }>
> = {
  home: {
    de: { title: SITE.de.title, description: SITE.de.description },
    en: { title: SITE.en.title, description: SITE.en.description },
  },
  leistungen: {
    de: {
      title: "Leistungen: PV-Engineering, Montage & Anlagenservice",
      description:
        "Beratung & Engineering, Umsetzung und Anlagenservice für Photovoltaik-Projekte: Machbarkeitsstudie, Planung, Behördenverfahren, Projektmanagement, Montage und Wartung – alles aus einer Hand.",
    },
    en: {
      title: "Services: PV Engineering, Installation & System Service",
      description:
        "Consulting & engineering, implementation and system service for photovoltaic projects: feasibility study, planning, permits, project management, installation and maintenance – all from a single source.",
    },
  },
  ueberUns: {
    de: {
      title: "Über uns – Ihr Montagepartner für Photovoltaik",
      description:
        "SYNERGIE Montagen Riegler GmbH aus Bad Vöslau: ein fixer Ansprechpartner mit Handschlagqualität für Photovoltaik-Projekte in Europa und Afrika.",
    },
    en: {
      title: "About us – Your installation partner for photovoltaics",
      description:
        "SYNERGIE Montagen Riegler GmbH from Bad Vöslau, Austria: one fixed contact person you can rely on for photovoltaic projects in Europe and Africa.",
    },
  },
  kontakt: {
    de: {
      title: "Kontakt – Ihr PV-Projekt anfragen",
      description:
        "Jetzt Photovoltaik-Projekt anfragen – wir melden uns innerhalb von 24 Stunden. SYNERGIE Montagen Riegler GmbH, Bad Vöslau, Telefon +43 664 244 87 42, office@synergie.cc.",
    },
    en: {
      title: "Contact – Request your PV project",
      description:
        "Request your photovoltaic project now – we will get back to you within 24 hours. SYNERGIE Montagen Riegler GmbH, Bad Vöslau, phone +43 664 244 87 42, office@synergie.cc.",
    },
  },
  montageBuchen: {
    de: {
      title: "PV Montage buchen",
      description:
        "PV-Montage online buchen: Projektunterlagen hochladen, Angaben prüfen, absenden – Rückmeldung innerhalb von 24 Stunden. Material, Planung, Montage und Projektmanagement aus einer Hand.",
    },
    en: {
      title: "Book PV installation",
      description:
        "Book your PV installation online: upload project documents, check the details, send – reply within 24 hours. Material, planning, installation and project management from a single source.",
    },
  },
  impressum: {
    de: {
      title: "Impressum",
      description: "Impressum der SYNERGIE Montagen Riegler GmbH, Bad Vöslau.",
    },
    en: {
      title: "Imprint",
      description:
        "Imprint of SYNERGIE Montagen Riegler GmbH, Bad Vöslau, Austria.",
    },
  },
  datenschutz: {
    de: {
      title: "Datenschutz",
      description: "Datenschutzerklärung der SYNERGIE Montagen Riegler GmbH.",
    },
    en: {
      title: "Privacy policy",
      description: "Privacy policy of SYNERGIE Montagen Riegler GmbH.",
    },
  },
  nutzungsbedingungen: {
    de: {
      title: "Nutzungsbedingungen",
      description: "Nutzungsbedingungen der Website synergie.cc.",
    },
    en: {
      title: "Terms of use",
      description: "Terms of use of the synergie.cc website.",
    },
  },
};

const langOf = (locale?: string): Lang => (locale === "en" ? "en" : "de");

/** Grund-Einstellungen für alle Seiten (Layout). */
export const siteMetadata = (locale?: string): Metadata => {
  const l = langOf(locale);
  const s = SITE[l];
  return {
    metadataBase: new URL("https://synergie.cc"),
    title: { default: s.title, template: "%s | SYNERGIE" },
    description: s.description,
    keywords: [...s.keywords],
    openGraph: {
      title: s.title,
      description: s.description,
      url: "https://synergie.cc",
      siteName: "SYNERGIE",
      images: [
        {
          url: "https://synergie.cc/brand/og-synergie.jpg",
          width: 1200,
          height: 630,
          alt:
            l === "en"
              ? "SYNERGIE – Photovoltaic project delivery"
              : "SYNERGIE – Photovoltaik Projektumsetzung",
        },
      ],
      locale: s.ogLocale,
      type: "website",
    },
  };
};

/** Titel + Beschreibung für eine einzelne Seite. */
export const pageMetadata = (
  key: PageKey,
  locale: string | undefined,
  canonical: string,
): Metadata => {
  const p = PAGES[key][langOf(locale)];
  // Echte Adresse mit Sprachkürzel (ohne Umleitung) + Verknüpfung DE/EN,
  // damit Google weiß, dass beide Sprachfassungen zusammengehören.
  const path = new URL(canonical).pathname.replace(/\/$/, "");
  const url = (l: string) => `https://synergie.cc/${l}${path}`;
  return {
    // Startseite: vollständiger Titel ohne Zusatz
    title: key === "home" ? { absolute: p.title } : p.title,
    description: p.description,
    alternates: {
      canonical: url(langOf(locale) === "en" ? "en" : "at-AT"),
      languages: {
        "de-AT": url("at-AT"),
        en: url("en"),
        "x-default": url("at-AT"),
      },
    },
    openGraph: {
      ...siteMetadata(locale).openGraph,
      url: url(langOf(locale) === "en" ? "en" : "at-AT"),
      title: key === "home" ? p.title : `${p.title} | SYNERGIE`,
      description: p.description,
    },
  };
};

/**
 * Strukturdaten für die Leistungs-Seite: sagt Google und KI-Suchen klar,
 * welche Leistungen SYNERGIE anbietet, für wen und wo.
 */
export const servicesJsonLd = (locale?: string) => {
  const en = langOf(locale) === "en";
  const groups: [string, string[]][] = en
    ? [
        [
          "Consulting & Engineering",
          [
            "Feasibility studies",
            "Technical support",
            "Concept design",
            "Permit procedures",
            "Planning",
          ],
        ],
        [
          "Implementation",
          [
            "Project management",
            "Site supervision",
            "Construction and installation",
            "Material procurement",
            "General contractor",
          ],
        ],
        ["System service", ["Maintenance", "Troubleshooting", "Cleaning"]],
      ]
    : [
        [
          "Beratung & Engineering",
          [
            "Machbarkeitsstudien",
            "Technische Unterstützung",
            "Konzeptdesign",
            "Behördenverfahren",
            "Planung",
          ],
        ],
        [
          "Umsetzung",
          [
            "Projektmanagement",
            "Örtliche Bauaufsicht",
            "Bauausführung",
            "Materialbeschaffung",
            "Generalunternehmer",
          ],
        ],
        ["Anlagenservice", ["Wartung", "Fehlerbehebung", "Reinigung"]],
      ];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: en
      ? "Photovoltaic project delivery and PV installation"
      : "Photovoltaik Projektumsetzung und PV-Montage",
    name: en
      ? "PV engineering, installation & system service"
      : "PV-Engineering, Montage & Anlagenservice",
    url: `https://synergie.cc/${en ? "en" : "at-AT"}/leistungen`,
    provider: { "@id": "https://synergie.cc/#organization" },
    areaServed: [
      { "@type": "Country", name: en ? "Austria" : "Österreich" },
      { "@type": "Place", name: en ? "Europe" : "Europa" },
      { "@type": "Place", name: en ? "Africa" : "Afrika" },
    ],
    audience: {
      "@type": "BusinessAudience",
      audienceType: en
        ? "EPC companies, electrical and building services contractors, plant operators, planners, property managers, real estate developers, architects"
        : "EPC-Unternehmen, Elektro- und Haustechnikbetriebe, Anlagenbetreiber, Planungsbüros, Hausverwaltungen, Immobilienentwickler, Architekten",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: en ? "Services" : "Leistungen",
      itemListElement: groups.map(([name, items]) => ({
        "@type": "OfferCatalog",
        name,
        itemListElement: items.map((n) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: n },
        })),
      })),
    },
  };
};
