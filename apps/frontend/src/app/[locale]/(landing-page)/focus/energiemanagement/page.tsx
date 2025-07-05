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

export default function Page(): JSX.Element {
  const t = useTranslations("LandingPage.ContactUs.Header");

  return (
    <>
      <meta
        name="keywords"
        content="Photovoltaik kaufen, PV-Anlage installieren lassen, Stromkosten sparen, Förderung Photovoltaik"
      />
      <PhotovoltaicHero translationProduct="Energy-Management" />
      <PhotovoltaicComponents translationProduct="Energy-Management" />
      <PhotovoltaicBackground translationProduct="Energy-Management" />
      <PhotovoltaicTestimonials translationProduct="Energy-Management" />
      <PhotovoltaicCta translationProduct="Energy-Management" />
    </>
  );
}
