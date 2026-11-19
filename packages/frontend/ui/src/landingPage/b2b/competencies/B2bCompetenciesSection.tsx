import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface B2bCompetenciesSectionProps {}

const ICONS = [
  "/frontend/landingPage/icons/clinical_notes_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg",
  "/frontend/landingPage/icons/build_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg",
  "/frontend/landingPage/icons/concierge_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg",
  "/frontend/landingPage/icons/view_timeline_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg",
];

/**
 * Überblick über alle Leistungsbereiche direkt unter dem Hero.
 * Die Karten werden aus `LandingPage.B2B.Services` erzeugt und springen per
 * Klick zum jeweiligen Bereich weiter unten auf der Seite.
 */
export const B2bCompetenciesSection = (props: B2bCompetenciesSectionProps) => {
  const t = useTranslations("LandingPage.B2B.Competencies");
  const messages: any = useMessages();
  const services: Record<string, any> =
    messages?.LandingPage?.B2B?.Services || {};

  return (
    <section
      id="ueberblick"
      className="container mx-auto px-6 lg:px-0 pb-16 pt-12 max-w-6xl"
    >
      <div className="text-center mb-10">
        <p className="text-synergy-light-blue font-semibold uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold">{t("title")}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(services).map((key, i) => {
          const subServices = services[key].SubServices || {};
          return (
            <a
              key={key}
              href={`#${key}`}
              className="group flex flex-col p-6 bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-0.5 transition border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-synergy-light-blue/15">
                  <Image
                    loader={ImageLoader}
                    width={28}
                    height={28}
                    src={ICONS[i % ICONS.length]}
                    alt=""
                  />
                </span>
                <h3 className="font-bold text-xl">{services[key].title}</h3>
              </div>
              <ul className="text-synergy-dark-grey space-y-1 mb-6 flex-1">
                {Object.keys(subServices).map((sub) => (
                  <li key={sub} className="flex gap-2">
                    <span className="text-synergy-light-blue">✓</span>
                    {String(subServices[sub]?.Diamond?.title || sub).replace(
                      /-\s*\n\s*/g,
                      "",
                    )}
                  </li>
                ))}
              </ul>
              <span className="font-semibold text-synergy-light-blue group-hover:translate-x-0.5 transition-transform">
                {t("linkText")} ↓
              </span>
            </a>
          );
        })}
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        {t("expandHint")}
      </p>
    </section>
  );
};

export default B2bCompetenciesSection;
