import Head from "next/head";
import B2bHero from "@com.synergy/frontend-ui/B2bHero";
import B2BServiceSection from "@com.synergy/frontend-ui/B2bServiceSection";
import B2bProcessSection from "@com.synergy/frontend-ui/B2bProcessSection";
import B2bTestimonialSection from "@com.synergy/frontend-ui/B2bTestimonialSection";
import B2bPartnersSection from "@com.synergy/frontend-ui/B2bPartnersSection";
import B2bFaqSection from "@com.synergy/frontend-ui/B2bFaqSection";
import B2bCompetenciesSection from "@com.synergy/frontend-ui/B2bCompetenciesSection";
import B2bCtaSection from "@com.synergy/frontend-ui/B2bCtaSection";
import ServiceWrapper from "@com.synergy/frontend-ui/ServiceWrapper";

export const metadata = {
  alternates: {
    canonical: "https://synergie.cc/b2b",
  },
};

export default function Page() {
  return (
    <>
      <Head>
        <title>B2B Services | Synergiemontagen.eco</title>
        <meta
          name="description"
          content="Professionelle B2B-Services im Bereich Photovoltaik, Wärmepumpen & Co. für Unternehmen. Qualität, Effizienz & After-Sales aus einer Hand."
        />
      </Head>
      <main className="">
        <B2bHero />
        {/* <B2BServiceSection /> */}
        <ServiceWrapper />
        <B2bCompetenciesSection />
        <B2bProcessSection />
        <B2bTestimonialSection />
        <B2bPartnersSection />
        <B2bFaqSection />
        <B2bCtaSection />
        {/* <ServicesSection />
        <ProcessSection />
        <TestimonialSection />
        <PartnersSection />
        <FAQSection />
        <ContactSection /> */}
      </main>
    </>
  );
}
