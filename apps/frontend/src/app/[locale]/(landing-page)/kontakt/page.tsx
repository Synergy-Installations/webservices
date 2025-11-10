import { Metadata } from "next";
import PageContainer from "@com.synergy/frontend-ui/PageContainer";

export const metadata: Metadata = {
  title: "Kontakt – Synergie Montagen Riegler GmbH",
  description:
    "Kontaktieren Sie uns: Büro Wien, Telefon +43 664 244 8742, office@synergie.cc – Ihr Fachbetrieb für nachhaltige Haustechnik.",
  keywords: [
    "Kontakt",
    "Wien",
    "Anfrage",
    "Telefon",
    "E-Mail",
    "Synergie Montagen",
  ],
  alternates: {
    canonical: "https://synergie.cc/kontakt",
  },
};

export default function Page(): JSX.Element {
  return (
    <PageContainer
      storageZoneAccessKey={process.env.STORAGE_ZONE_ACCESS_KEY}
    />
  );
}
