import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface AboutHeroProps {}

export const AboutHero = (props: AboutHeroProps) => {
  const t = useTranslations("LandingPage.About.Hero");

  return (
    <section className="relative">
      {/* Dark background */}
      <div
        className="absolute inset-0 bg-synergy-dark-grey pointer-events-none"
        aria-hidden="true"
      >
        {/* Echtes Baustellenfoto: SYNERGIE-Montageteam am Dach */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover object-[50%_35%]"
          src="/brand/projekte/ueber-uns-hero.webp"
          width={1920}
          height={1080}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-br from-synergy-light-blue/80 to-synergy-dark-grey/70" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 md:pt-40 pb-16 md:pb-24">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="h1 text-4xl md:text-6xl font-bold !-tracking-[0.01em] font-inter text-slate-100">
              {t("title")}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
