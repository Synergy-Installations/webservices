import Image from "next/image";
import { Card } from "@com.synergy/frontend-ui/card";
import { useTranslations } from "next-intl";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import HeroHome from "@com.synergy/frontend-ui/HeroHome";
import { ServiceCatalog } from "@com.synergy/frontend-ui/ServiceCatalog";
import { FeatureTabs } from "@com.synergy/frontend-ui/FeatureTabs";
import { FeaturesGlobe } from "@com.synergy/frontend-ui/FeaturesGlobe";
import { LargeTestimonial } from "@com.synergy/frontend-ui/LargeTestimonial";
import { CtaBars } from "@com.synergy/frontend-ui/CtaBars";
import { TestimonialsCarousel } from "@com.synergy/frontend-ui/TestimonialsCarousel";
import HeroFull from "@com.synergy/frontend-ui/HeroFull";
import { FeatureAdvantages } from "@com.synergy/frontend-ui/FeatureAdvantages";
import FeatureSteps from "@com.synergy/frontend-ui/FeatureSteps";
import CtaLoose from "@com.synergy/frontend-ui/CtaLoose";
import { TracingBeam } from "@com.synergy/frontend-ui/TracingBeam";
import Head from "next/head";
import BentoGridHero from "@com.synergy/frontend-ui/BentoGridHero";

export const metadata = {
  alternates: {
    canonical: "https://synergie.cc/",
  },
};

export default function Page(): JSX.Element {
  // const t = useTranslations("Index");

  return (
    <>
      {/* <TracingBeam> */}
      <BentoGridHero />
      <FeatureSteps />
      <FeatureAdvantages />
      {/* <HeroFull />
      <ServiceCatalog /> */}
      <TestimonialsCarousel />
      <CtaLoose />
      {/* </TracingBeam> */}
    </>
  );
}
