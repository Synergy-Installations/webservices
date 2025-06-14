import { ContactBlocks } from "@com.synergy/frontend-ui/ContactBlocks";
import { ContactCommunity } from "@com.synergy/frontend-ui/ContactCommunity";
import { Form } from "@com.synergy/frontend-ui/Form";
import RichText from "@com.synergy/frontend-ui/RichText";
import { useTranslations } from "next-intl";
import { PhotovoltaicHero } from "@com.synergy/frontend-ui/PhotovoltaicHero";
import { PhotovoltaicComponents } from "@com.synergy/frontend-ui/PhotovoltaicComponents";
import { PhotovoltaicBackground } from "@com.synergy/frontend-ui/PhotovoltaicBackground";
import { PhotovoltaicTestimonials } from "@com.synergy/frontend-ui/PhotovoltaicTestimonials";
import { PhotovoltaicCta } from "@com.synergy/frontend-ui/PhotovoltaicCta";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fokus Photovoltaik – PV-Anlagen & Speicher | Synergie Montagen",
  description:
    "Ganzheitliche Photovoltaik-Komplettlösungen: Module, Wechselrichter, Speicher & Installation für maximale Effizienz.",
  keywords: [
    "Photovoltaik",
    "PV-Anlage",
    "Solar Speicher",
    "Wechselrichter",
    "PV Komplettlösung",
  ],
};

export default function Page(): JSX.Element {
  const t = useTranslations("LandingPage.ContactUs.Header");

  return (
    <>
      <meta
        name="keywords"
        content="Photovoltaik kaufen, PV-Anlage installieren lassen, Stromkosten sparen, Förderung Photovoltaik"
      />
      <PhotovoltaicHero />
      <PhotovoltaicComponents />
      <PhotovoltaicBackground />
      <PhotovoltaicTestimonials />
      <PhotovoltaicCta />
    </>
  );
}
