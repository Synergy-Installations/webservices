import type { Metadata } from "next";
import { pageMetadata } from "./seo";
import { TestimonialsCarousel } from "@com.synergy/frontend-ui/TestimonialsCarousel";
import { fetchGoogleReviews } from "@com.synergy/frontend-ui/GoogleReviews";
import { FeatureAdvantages } from "@com.synergy/frontend-ui/FeatureAdvantages";
import FeatureSteps from "@com.synergy/frontend-ui/FeatureSteps";
import HeroLogoCta from "@com.synergy/frontend-ui/HeroLogoCta";
import CtaLoose from "@com.synergy/frontend-ui/CtaLoose";
import BentoGridHero from "@com.synergy/frontend-ui/BentoGridHero";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMetadata("home", locale, "https://synergie.cc/");
}

export default async function Page({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<JSX.Element> {
  // Aktuelle Google-Bewertungen (leer, solange kein Google-Schlüssel hinterlegt ist)
  const googleReviews = await fetchGoogleReviews(locale === "en" ? "en" : "de");

  return (
    <>
      <BentoGridHero />
      <FeatureSteps />
      <FeatureAdvantages />
      <TestimonialsCarousel googleReviews={googleReviews} />
      <HeroLogoCta hero="logo-held-gruen" className="pt-12 md:pt-16" />
      <CtaLoose />
    </>
  );
}
