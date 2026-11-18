import Head from "next/head";
import B2bHero from "@com.synergy/frontend-ui/B2bHero";
import B2bProcessSection from "@com.synergy/frontend-ui/B2bProcessSection";
import B2bTestimonialSection from "@com.synergy/frontend-ui/B2bTestimonialSection";
import B2bPartnersSection from "@com.synergy/frontend-ui/B2bPartnersSection";
import B2bCompetenciesSection from "@com.synergy/frontend-ui/B2bCompetenciesSection";
import B2bCtaSection from "@com.synergy/frontend-ui/B2bCtaSection";
import HeroLogoCta from "@com.synergy/frontend-ui/HeroLogoCta";
import QualityChecklist from "@com.synergy/frontend-ui/QualityChecklist";
import ServiceWrapper from "@com.synergy/frontend-ui/ServiceWrapper";

export const metadata = {
  alternates: {
    canonical: "https://synergie.cc/leistungen",
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
      <main className="">
        <B2bHero />
        <B2bCompetenciesSection />
        <ServiceWrapper />
        <QualityChecklist section="leistungen" hero="synergie-held" />
        <B2bProcessSection />
        <B2bTestimonialSection />
        <B2bPartnersSection />
        <HeroLogoCta hero="logo-heldin-rot" className="pt-12" />
        <B2bCtaSection />
      </main>
    </>
  );
}
