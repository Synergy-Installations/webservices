import "./globals.css";
import "@com.synergy/frontend-ui/frontendUiStyles.css";
import {
  GatedGoogleTag,
  GatedYandexTag,
} from "./_components/ConsentGatedTracking";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  ConsentManagerDialog,
  ConsentManagerProvider,
  CookieBanner,
  type ConsentManagerOptions,
  // @ts-ignore
} from "@c15t/react";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import atCookieMessages from "@com.synergy/frontend-shared-internationalization/messages/at-AT.json";
import enCookieMessages from "@com.synergy/frontend-shared-internationalization/messages/en.json";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The root layout sits above the `[locale]` segment, so it has no `locale`
  // param. next-intl resolves the active locale from the request instead.
  const locale = await getLocale();

  // c15t matches translations by language subtag (e.g. "de", "en").
  const consentLanguage = locale.split("-")[0] === "en" ? "en" : "de";

  const options: ConsentManagerOptions = {
    mode: "c15t",
    backendURL: process.env.NEXT_PUBLIC_C15T_URL || "",
    // Drive the cookie banner / consent dialog from the site's selected
    // language instead of the visitor's browser language.
    translations: {
      defaultLanguage: consentLanguage,
      disableAutoLanguageSwitch: true,
      translations: {
        de: atCookieMessages.CookieConsent,
        en: enCookieMessages.CookieConsent,
      },
    },
  };

  const geoZones = [
    // numeric zones already supplied
    { lat: 47.813793, lon: 16.059164, radius: 15000 },
    { lat: 47.99791, lon: 16.086629, radius: 15000 },
    { lat: 48.105442, lon: 16.554913, radius: 10000 },
    { lat: 48.230007, lon: 16.633191, radius: 10000 },
    { lat: 48.327798, lon: 16.585126, radius: 10000 },
    { lat: 48.386073, lon: 16.322835, radius: 15000 },
    // converted city zones
    { lat: 48.04687, lon: 16.31384, radius: 15000 }, // Guntramsdorf
    { lat: 47.82756, lon: 16.29873, radius: 15000 }, // Lichtenwörth
    { lat: 48.183, lon: 16.083, radius: 10000 }, // Pressbaum
    { lat: 48.3283, lon: 16.0586, radius: 15000 }, // Tulln
  ];

  const serviceArea = geoZones.map((z) => ({
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: z.lat,
      longitude: z.lon,
    },
    geoRadius: z.radius,
  }));

  return (
    <ConsentManagerProvider options={options}>
      <ClerkProvider>
        <html lang={locale} className="scroll-smooth">
          <body className="relative">
            <GatedYandexTag>{children}</GatedYandexTag>
            <Script id="ld-json" type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name: "Synergie Montagen Riegler GmbH",
                url: "https://synergie.cc",
                telephone: "+43 664 244 87 42",
                email: "office@synergie.cc",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Wagenseilgasse 14",
                  addressLocality: "Wien",
                  postalCode: "1120",
                  addressCountry: "AT",
                },
                sameAs: [
                  "https://www.facebook.com/synergiemontagen/",
                  "https://www.instagram.com/synergiemontagen/",
                  "https://at.linkedin.com/company/synergie-montagen-riegler-gmbh",
                ],
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 48.386073,
                  longitude: 16.322835,
                },
                serviceArea,
                description:
                  "Fachbetrieb für Photovoltaik, Wärmepumpen, Klimasysteme, Smart Home & Wallbox‑Lösungen in Wien & Niederösterreich. Persönliche Beratung & Handschlagqualität vom jungen, dynamischen Team.",
                openingHours: ["Mo-Fr 08:00-17:00", "Sa 08:00-12:00"],
                openingHoursSpecification: [
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                    ],
                    opens: "08:00",
                    closes: "17:00",
                  },
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Saturday",
                    opens: "08:00",
                    closes: "12:00",
                  },
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Sunday",
                    opens: "00:00",
                    closes: "00:00",
                  },
                ],
                image: [
                  "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/Hero/house-technical-illustration-3.jpeg",
                  "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/AboutUsCard/Familie.jpeg",
                  "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/FeatureAdvantages/Together_future_buildings.jpg",
                ],
                logo: "https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/icons/Flyer%20Synergie%20B2C%20v1(1).png",
                priceRange: "€€",
                paymentAccepted: [
                  "Cash",
                  "BankTransfer",
                  "CreditCard",
                  "DebitCard",
                  "Invoice",
                ],
                review: [
                  {
                    "@type": "Review",
                    reviewBody:
                      "Ich bin persönlich rund um zufrieden! Zuverlässigkeit, Entgegenkommen, persönliche und vertrauensvolle Firma. Im Endeffekt treffen die Punkte zu mit denen geworben wird - Handschlagqualität. Ich lass mir auch von der selben Firma die PV-Anlage erweitern.",
                    author: {
                      "@type": "Person",
                      name: "Otto Eichwalder",
                    },
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: 5,
                      bestRating: 5,
                      worstRating: 1,
                    },
                    url: "https://g.co/kgs/tkBkdUm",
                  },
                  {
                    "@type": "Review",
                    reviewBody:
                      "Die Firma besteht aus einem jungen-dynamischen Team. Es gibt noch eine persönliche Beratung. Der Projektbericht wurde ausführlich und rasch übermittelt. Die Arbeiten wurden sauber und termingerecht ausgeführt. Herr Riegler ist sehr um seine Kunden bemüht. Diese Firma ist wirklich empfehlenswert!",
                    author: {
                      "@type": "Person",
                      name: "Manfred Hein",
                    },
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: 5,
                      bestRating: 5,
                      worstRating: 1,
                    },
                    url: "https://g.co/kgs/tkBkdUm",
                  },
                  {
                    "@type": "Review",
                    reviewBody:
                      "Super Firma, sehr kompetent und sehr zu empfehlen. Tolle Beratung und Planung, zeitnahe Umsetzung - hat alles super funktioniert - bin rundum sehr zufrieden. Sehr gutes Preis- / Leistungsverhältnis - einfach top!",
                    author: {
                      "@type": "Person",
                      name: "Andreas Goisser",
                    },
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: 5,
                      bestRating: 5,
                      worstRating: 1,
                    },
                    url: "https://g.co/kgs/tkBkdUm",
                  },
                ],
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: 5,
                  reviewCount: 3,
                  bestRating: 5,
                  worstRating: 1,
                },
                // Add more properties as needed
              })}
            </Script>
          </body>
          <CookieBanner
            theme={{
              "banner.footer": "bg-synergy-light-blue/10",
              "banner.footer.reject-button": "rounded-lg",
              "banner.footer.customize-button": "rounded-lg",
              "banner.footer.accept-button":
                "text-white rounded-lg !shadow-none bg-gradient-to-t from-synergy-light-blue via-synergy-light-blue/70 to-synergy-light-blue hover:from-synergy-light-blue hover:to-synergy-light-blue",
            }}
          />
          <ConsentManagerDialog />
          <GatedGoogleTag />
        </html>
      </ClerkProvider>
    </ConsentManagerProvider>
  );
}
