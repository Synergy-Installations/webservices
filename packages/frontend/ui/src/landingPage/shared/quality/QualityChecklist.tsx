import { useMessages, useTranslations } from "next-intl";
import HeroImage, { type HeroImageName } from "../heroes/HeroImage";

export interface QualityChecklistProps {
  /** Welcher Text-Block aus `LandingPage.Shared.Quality` gezeigt wird. */
  section: "leistungen" | "about" | "contact";
  /** SYNERGIE-Held mit aktuellem Logo neben der Checkliste. */
  hero?: Extract<HeroImageName, `synergie-${string}`>;
  /** Nummern statt Häkchen (z. B. für „Nächste Schritte“). */
  numbered?: boolean;
  className?: string;
}

/** Abgehaktes Kästchen – Zeichen für Projekt- und Qualitätsmanagement. */
export const CheckBox = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-synergy-light-blue bg-synergy-light-blue/10 text-synergy-light-blue ${className}`}
  >
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

/**
 * Checkliste im Stil der SYNERGIE-Angebote („IHR MEHRWERT“, „WARUM SYNERGIE?“,
 * „NÄCHSTE SCHRITTE“) mit einem SYNERGIE-Helden daneben.
 */
export const QualityChecklist = ({
  section,
  hero,
  numbered = false,
  className = "",
}: QualityChecklistProps) => {
  const t = useTranslations(`LandingPage.Shared.Quality.${section}`);
  const th = useTranslations("LandingPage.Shared.Heroes");
  const messages: any = useMessages();
  const data = messages?.LandingPage?.Shared?.Quality?.[section] || {};
  const items: { title: string; text: string }[] = data.items || [];
  const photos: { src: string; caption: string }[] = data.photos || [];

  return (
    <section className={`px-4 py-12 md:py-16 ${className}`}>
      <div
        className={`mx-auto grid max-w-5xl items-start gap-10 ${hero ? (hero.includes("paar") ? "md:grid-cols-[1fr_18rem]" : "md:grid-cols-[1fr_16rem]") : ""}`}
      >
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-synergy-light-blue">
            {t("eyebrow")}
          </p>
          <h2 className="mb-3 text-3xl font-black uppercase tracking-wide text-synergy-dark-grey md:text-4xl">
            {t("title")}
          </h2>
          <div className="mb-8 h-1 w-16 bg-synergy-light-blue" />
          {data.body ? (
            <p className="mb-6 text-lg text-synergy-dark-grey">{t("body")}</p>
          ) : null}
          <ul className="divide-y divide-synergy-light-grey rounded-2xl border border-synergy-light-grey bg-white">
            {items.map((item, i) => (
              <li key={item.title} className="flex gap-4 px-5 py-4">
                {numbered ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-synergy-light-blue text-sm font-bold text-white">
                    {i + 1}
                  </span>
                ) : (
                  <CheckBox />
                )}
                <span>
                  <span className="block font-bold uppercase tracking-wide text-synergy-dark-grey">
                    {item.title}
                  </span>
                  <span className="block text-synergy-dark-grey/80">
                    {item.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {/* Echte Detailfotos – Präzision auf der Baustelle */}
          {photos.length > 0 ? (
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {photos.map((p) => (
                <li
                  key={p.src}
                  className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt={p.caption}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <p className="px-2 py-1.5 text-xs font-semibold leading-tight text-synergy-dark-grey">
                    {p.caption}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {hero ? (
          <HeroImage
            name={hero}
            alt={th("synergieAlt")}
            className={`mx-auto ${hero.includes("paar") ? "aspect-square w-56 md:w-72" : "aspect-[2/3] w-44 md:w-64"}`}
          />
        ) : null}
      </div>
    </section>
  );
};

export default QualityChecklist;
