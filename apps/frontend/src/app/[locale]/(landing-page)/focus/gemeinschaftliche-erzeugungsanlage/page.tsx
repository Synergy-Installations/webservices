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
    canonical: "https://synergie.cc/focus/gemeinschaftliche-erzeugungsanlage",
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
      <PhotovoltaicHero translationProduct="Community-Generation-Plant" />
      <PhotovoltaicComponents translationProduct="Community-Generation-Plant" />
      <PhotovoltaicBackground translationProduct="Community-Generation-Plant" />
      <PhotovoltaicTestimonials translationProduct="Community-Generation-Plant" />
      <PhotovoltaicCta translationProduct="Community-Generation-Plant" />
    </>
  );
}
