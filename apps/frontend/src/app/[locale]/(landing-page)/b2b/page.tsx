import type { Metadata } from "next";
import { pageMetadata, servicesJsonLd } from "../seo";
import B2bHero from "@com.synergy/frontend-ui/B2bHero";
import B2bProcessSection from "@com.synergy/frontend-ui/B2bProcessSection";
import B2bTestimonialSection from "@com.synergy/frontend-ui/B2bTestimonialSection";
import B2bPartnersSection from "@com.synergy/frontend-ui/B2bPartnersSection";
import B2bCompetenciesSection from "@com.synergy/frontend-ui/B2bCompetenciesSection";
import B2bCtaSection from "@com.synergy/frontend-ui/B2bCtaSection";
import HeroLogoCta from "@com.synergy/frontend-ui/HeroLogoCta";
import QualityChecklist from "@com.synergy/frontend-ui/QualityChecklist";
import ProjectGallery from "@com.synergy/frontend-ui/ProjectGallery";
import ServiceWrapper from "@com.synergy/frontend-ui/ServiceWrapper";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMetadata("leistungen", locale, "https://synergie.cc/leistungen");
}

export default function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <>
      <main className="">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(servicesJsonLd(locale)),
          }}
        />
        <B2bHero />
        <B2bCompetenciesSection />
        <ServiceWrapper />
        <ProjectGallery />
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
