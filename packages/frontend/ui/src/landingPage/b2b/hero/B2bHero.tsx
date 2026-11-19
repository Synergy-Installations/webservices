import { useTranslations } from "next-intl";
import Link from "next/link";

/* eslint-disable-next-line */
export interface B2bHeroProps {}

export const B2bHero = (props: B2bHeroProps) => {
  const t = useTranslations("LandingPage.B2B");

  return (
    <section
      className="relative min-h-[70svh] pt-40 pb-16 bg-cover bg-center flex items-end"
      style={{
        backgroundImage:
          "url('/brand/projekte/leistungen-hero.webp')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <div className="relative container mx-auto px-6 lg:px-8 flex flex-col justify-end items-start h-full text-white space-y-4">
        <p className="uppercase tracking-widest font-semibold text-sm lg:text-base">
          {t("Hero.eyebrow")}
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
          {t("Hero.title")}
        </h1>
        <h2 className="text-lg md:text-2xl font-medium">
          {t("Hero.subtitle")}
        </h2>
        {t.has("Hero.body") ? (
          <p className="max-w-2xl text-sm md:text-base">{t("Hero.body")}</p>
        ) : null}
        <div className="pt-4">
          <Link
            className="btn group mb-0 !py-4 !px-5 !text-lg before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow relative"
            href={t("Hero.buttons.primary.href")}
          >
            <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
              {t("Hero.buttons.primary.text")}
              <span className="ml-2 whitespace-nowrap">{"->"}</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default B2bHero;
