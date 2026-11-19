import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import AboutCta from "@com.synergy/frontend-ui/AboutCta";
import AboutHero from "@com.synergy/frontend-ui/AboutHero";
import AboutStory from "@com.synergy/frontend-ui/AboutStory";
import HeroLogoCta from "@com.synergy/frontend-ui/HeroLogoCta";
import QualityChecklist from "@com.synergy/frontend-ui/QualityChecklist";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMetadata("ueberUns", locale, "https://synergie.cc/about-us");
}

export default function Page() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <QualityChecklist section="about" hero="synergie-held" />
      <HeroLogoCta hero="logo-heldin-lila" className="pb-12" />
      <AboutCta />
    </>
  );
}
