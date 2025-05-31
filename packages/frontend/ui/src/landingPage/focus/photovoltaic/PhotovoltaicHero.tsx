import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface PhotovoltaicHeroProps {}

export const PhotovoltaicHero = (props: PhotovoltaicHeroProps) => {
  const t = useTranslations("LandingPage.Focus.Photovoltaic.Hero");

  return (
    <section
      className="relative h-full min-h-[500px] bg-cover bg-center"
      style={{
        backgroundImage: `url('${t("backgroundImage.src")}')`,
      }}
    >
      <div className="bg-black/40 flex flex-col items-center justify-between text-white text-center px-4 pt-40 pb-12">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-3">
            <span className="w-max bg-black px-2 py-1 rounded-2xl">
              {t("titleUpper")}
            </span>
          </h2>
          <h2 className="text-4xl font-bold mb-4">
            <span className="w-max bg-black px-2 py-1 rounded-2xl">
              {t("titleLower")}
            </span>
          </h2>
          <p className="text-lg mb-6 max-w-2xl">{t("description")}</p>
        </div>
        <a
          href={t("button.href")}
          className="border border-white hover:border-synergy-light-blue py-2 mt-20 px-4 rounded-md hover:bg-synergy-light-blue hover:text-white transition"
        >
          {t("button.text")}
        </a>
      </div>
    </section>
  );
};

export default PhotovoltaicHero;
