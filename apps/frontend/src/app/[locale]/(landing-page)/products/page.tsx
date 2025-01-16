import { HeroVideoFull } from "@com.synergy/frontend-ui/HeroVideoFull";
import { DefaultProductCard } from "@com.synergy/frontend-ui/DefaultProductCard";
import { AboutUsCard } from "@com.synergy/frontend-ui/AboutUsCard";
import { PackagesCard } from "@com.synergy/frontend-ui/PackagesCard";
import { TracingBeam } from "@com.synergy/frontend-ui/TracingBeam";

import { useTranslations } from "next-intl";
import CtaLoose from "@com.synergy/frontend-ui/CtaLoose";

export default function Page(): JSX.Element {
  const t = useTranslations("Index");

  return (
    <>
      <TracingBeam>
        <HeroVideoFull />
        <DefaultProductCard />
        <DefaultProductCard orientation="left" />
        <DefaultProductCard />
        <DefaultProductCard orientation="left" />
        <DefaultProductCard />
        <DefaultProductCard orientation="left" />
        <AboutUsCard />
        <PackagesCard />
        <CtaLoose />
      </TracingBeam>
    </>
  );
}
