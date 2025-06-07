import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface PhotovoltaicHeroProps {}

export const PhotovoltaicHero = (props: PhotovoltaicHeroProps) => {
  const t = useTranslations("LandingPage.Focus.Photovoltaic.Hero");

  return (
    <section
      className="relative h-full bg-cover bg-center"
      style={{
        backgroundImage: `url('${t("backgroundImage.src")}')`,
      }}
    >
      <div className="bg-black/40 h-full min-h-[600px] flex flex-col items-center justify-between text-white text-center px-4 pt-40 pb-12">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-3">
            <span className="w-max bg-black px-2 py-1 rounded-2xl">
              {t("titleUpper")}
            </span>
          </h2>
          <h2 className="text-4xl font-bold mb-6">
            <span className="w-max bg-black px-2 py-1 rounded-2xl">
              {t("titleLower")}
            </span>
          </h2>
          <p className="text-2xl mb-6 text-center">{t("description")}</p>
        </div>
        <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
          <a
            className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line"
            href={t("button.href")}
          >
            <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line">
              {t("button.text")}
              <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                <div className=" whitespace-nowrap">{"->"}</div>
              </div>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default PhotovoltaicHero;
