import { useMessages, useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface ProjectGalleryProps {}

/**
 * „Aus unseren Projekten“: echte Baustellen- und Projektfotos mit kurzer
 * Beschreibung. Bilder liegen unter /brand/projekte/, Texte in
 * `LandingPage.B2B.Projects`. Ein Klick öffnet das Foto groß.
 */
export const ProjectGallery = (props: ProjectGalleryProps) => {
  const t = useTranslations("LandingPage.B2B.Projects");
  const messages: any = useMessages();
  const items: { src: string; caption: string }[] =
    messages?.LandingPage?.B2B?.Projects?.items || [];

  if (items.length === 0) return null;

  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-synergy-light-blue">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl font-black uppercase tracking-wide text-synergy-dark-grey md:text-4xl">
            {t("title")}
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 bg-synergy-light-blue" />
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((item) => (
            <li key={item.src}>
              <a
                href={item.src}
                target="_blank"
                rel="noopener"
                className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ProjectGallery;
