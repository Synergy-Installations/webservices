import "@com.synergy/frontend-ui/landingPageStyles.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@com.synergy/frontend-shared-internationalization/routing";
import DefaultLayout from "@com.synergy/frontend-ui/DefaultLayout";

// const inter = Inter({ subsets: ["latin"] });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://synergie.cc"),
  title: {
    default:
      "Synergiemontagen – Photovoltaik & Haustechnik in Wien und Niederösterreich",
    template: "%s | Synergiemontagen",
  },
  description:
    "Nachhaltige Photovoltaik-, Wärmepumpen-, Smart‑Home‑ und Wallbox‑Lösungen in Wien und Niederösterreich. Persönliche Beratung & Handschlagqualität vom jungen, dynamischen Team.",
  keywords: [
    "Synergie Montagen",
    "Photovoltaik",
    "Wärmepumpe",
    "Smart Home",
    "Wallbox",
    "Energiesysteme",
  ],
  openGraph: {
    title: "Synergiemontagen – Photovoltaik & Haustechnik in Wien",
    description:
      "Nachhaltige PV-, Wärme-, Klima- und Smart‑Home‑Lösungen mit Handschlagqualität. Individuelle Beratung & Förderung inklusive.",
    url: "https://synergie.cc",
    siteName: "Synergiemontagen",
    images: [
      {
        url: "/frontend/landingPage/Hero/house-technical-illustration-3.jpeg",
        width: 1200,
        height: 630,
        alt: "Photovoltaik Installation von Synergiemontagen in Wien",
      },
    ],
    locale: "at_AT",
    type: "website",
  },
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <DefaultLayout>{children}</DefaultLayout>
      </NextIntlClientProvider>
    </>
  );
}
