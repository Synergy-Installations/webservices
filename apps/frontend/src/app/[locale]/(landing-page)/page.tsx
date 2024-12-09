import Image from "next/image";
import { Card } from "@com.synergy/frontend-ui/card";
import { useTranslations } from "next-intl";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import HeroHome from "@com.synergy/frontend-ui/HeroHome";
import { MarqueeTestimonials } from "@com.synergy/frontend-ui/MarqueeTestimonials";

export default function Page(): JSX.Element {
  const t = useTranslations("Index");

  return (
    <>
      <HeroHome />
      <MarqueeTestimonials />
    </>
  );
}
