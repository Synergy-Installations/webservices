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
import ScrollUp from "@com.synergy/frontend-ui/ScrollUp";

export const metadata = {
  alternates: {
    canonical: "https://synergie.cc/focus/smart-home",
  },
};

export default function Page(): JSX.Element {
  const t = useTranslations("LandingPage.ContactUs.Header");

  return (
    <>
      <meta
        name="keywords"
        content="Photovoltaik kaufen, PV-Anlage installieren lassen, Stromkosten sparen, Förderung Photovoltaik"
      />
      <ScrollUp />
      <PhotovoltaicHero translationProduct="Smart-Home" />
      <PhotovoltaicComponents translationProduct="Smart-Home" />
      <PhotovoltaicBackground translationProduct="Smart-Home" />
      <PhotovoltaicTestimonials translationProduct="Smart-Home" />
      <PhotovoltaicCta translationProduct="Smart-Home" />
    </>
  );
}
