import { useTranslations } from "next-intl";
import HeroImage, { type HeroImageName } from "./HeroImage";

export interface HeroLogoCtaProps {
  /** Welche Heldin / welcher Held mit „Hier könnte Ihr Logo stehen“ gezeigt wird. */
  hero?: Extract<HeroImageName, `logo-${string}`>;
  className?: string;
}

/**
 * Dezentes Band beim Kontakt-Bereich jeder Seite:
 * Held mit „Hier könnte Ihr Logo stehen“ + „Unsere Kunden verdienen Umhänge.“
 * Bewusst ohne eigenen Knopf – der nächste Schritt ist der Kontakt-Knopf daneben.
 */
export const HeroLogoCta = ({
  hero = "logo-held-gruen",
  className = "",
}: HeroLogoCtaProps) => {
  const t = useTranslations("LandingPage.Shared.Heroes");

  return (
    <section className={`px-4 sm:px-6 ${className}`}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-synergy-light-grey bg-white p-6 shadow-sm sm:flex-row sm:gap-10 sm:p-8">
        <HeroImage
          name={hero}
          alt={t("logoAlt")}
          className="aspect-[3/4] w-40 shrink-0 sm:w-48"
        />
        <div className="text-center sm:text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-synergy-light-blue">
            {t("logoCta.eyebrow")}
          </p>
          <h2 className="mb-3 text-2xl font-black uppercase tracking-wide text-synergy-dark-grey md:text-3xl">
            {t("logoCta.title")}
          </h2>
          <p className="text-synergy-dark-grey">{t("logoCta.body")}</p>
        </div>
      </div>
    </section>
  );
};

export default HeroLogoCta;
