import { useMessages, useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface FaqSectionProps {
  className?: string;
}

/**
 * „Häufige Fragen“: kurze, klare Antworten zu SYNERGIE. Hilft Kund:innen –
 * und Google sowie KI-Suchen (ChatGPT, Perplexity …), die solche Fragen und
 * Antworten gerne direkt übernehmen. Texte in `LandingPage.Shared.Faq`.
 */
export const FaqSection = ({ className = "" }: FaqSectionProps) => {
  const t = useTranslations("LandingPage.Shared.Faq");
  const messages: any = useMessages();
  const items: { q: string; a: string }[] =
    messages?.LandingPage?.Shared?.Faq?.items || [];

  if (items.length === 0) return null;

  // Strukturdaten für Google / KI (FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className={`px-4 py-12 md:py-16 ${className}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-synergy-light-blue">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl font-black uppercase tracking-wide text-synergy-dark-grey md:text-4xl">
            {t("title")}
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 bg-synergy-light-blue" />
        </div>
        <ul className="divide-y divide-synergy-light-grey rounded-2xl border border-synergy-light-grey bg-white">
          {items.map((item) => (
            <li key={item.q}>
              <details className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-synergy-dark-grey [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-synergy-light-blue/10 text-lg text-synergy-light-blue transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-synergy-dark-grey/80">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FaqSection;
