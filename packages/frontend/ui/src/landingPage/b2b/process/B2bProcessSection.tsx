import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface B2bProcessSectinoProps {}

/**
 * „Synergie Digiversum“: der digitale Projektablauf als Grafik
 * (Kunde in der Mitte). Kompakt, damit alles auf einen Blick passt.
 * Auf dem Handy öffnet ein Tipp das Bild in voller Größe.
 */
export const B2bProcessSection = (props: B2bProcessSectinoProps) => {
  const t = useTranslations("LandingPage.B2B.Process");

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wide text-synergy-dark-grey">
          {t("title")}
        </h2>
        <div className="w-16 h-1 bg-synergy-light-blue mt-4 mb-8 mx-auto" />
        <a
          href={t("image.src")}
          target="_blank"
          rel="noopener"
          className="block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t("image.src")}
            alt={t("image.alt")}
            width={1589}
            height={1054}
            loading="lazy"
            className="mx-auto h-auto max-h-[78vh] w-auto max-w-full"
          />
        </a>
      </div>
    </section>
  );
};

export default B2bProcessSection;
