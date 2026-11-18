import AboutCta from "@com.synergy/frontend-ui/AboutCta";
import AboutHero from "@com.synergy/frontend-ui/AboutHero";
import AboutStory from "@com.synergy/frontend-ui/AboutStory";
import HeroLogoCta from "@com.synergy/frontend-ui/HeroLogoCta";
import QualityChecklist from "@com.synergy/frontend-ui/QualityChecklist";
import Head from "next/head";

export const metadata = {
  alternates: {
    canonical: "https://synergie.cc/about-us",
  },
};

export default function Page() {
  return (
    <>
      <Head>
        <title>B2B Services | Synergie.cc</title>
        <meta
          name="description"
          content="Professionelle B2B-Services im Bereich Photovoltaik, Wärmepumpen & Co. für Unternehmen. Qualität, Effizienz & After-Sales aus einer Hand."
        />
      </Head>
      <AboutHero />
      <AboutStory />
      <QualityChecklist section="about" hero="synergie-heldin" />
      <HeroLogoCta hero="logo-heldin-lila" className="pb-12" />
      <AboutCta />
    </>
  );
}
