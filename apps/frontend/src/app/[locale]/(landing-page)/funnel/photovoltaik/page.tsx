import { ContactBlocks } from "@com.synergy/frontend-ui/ContactBlocks";
import { ContactCommunity } from "@com.synergy/frontend-ui/ContactCommunity";
import { Form } from "@com.synergy/frontend-ui/Form";
import Funnel from "@com.synergy/frontend-ui/Funnel";
import FunnelLayout from "@com.synergy/frontend-ui/FunnelLayout";
import RichText from "@com.synergy/frontend-ui/RichText";
import { Metadata } from "next";
import { useTranslations } from "next-intl";

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
    canonical: "https://synergie.cc/funnel/photovoltaik",
  },
};

export default function Page(): JSX.Element {
  const t = useTranslations("LandingPage.ContactUs.Header");

  return (
    <FunnelLayout>
      <Funnel STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY} />
    </FunnelLayout>
  );
}
