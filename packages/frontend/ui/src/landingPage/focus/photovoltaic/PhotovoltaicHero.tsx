import { useMessages, useTranslations } from "next-intl";
import RichText from "../../../shared/internationalization/text/RichText";

/* eslint-disable-next-line */
export interface PhotovoltaicHeroProps {
  translationProduct?: string;
}

export const PhotovoltaicHero = (props: PhotovoltaicHeroProps) => {
  const { translationProduct } = props;
  const t = useTranslations(`LandingPage.Focus.${translationProduct}.Hero`);

  const messages: any = useMessages();

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
            <span className="w-max">
              <RichText className="bg-synergy-light-blue/40 backdrop-blur-md px-2 py-1 rounded-2xl">
                {(tags) => t.rich("titleUpper", tags)}
              </RichText>
            </span>
          </h2>
          {messages.LandingPage.Focus[`${translationProduct}`].Hero
            .titleLower && (
            <h2 className="text-4xl font-bold">
              <span className="w-max">
                <RichText className="bg-synergy-light-blue/40 backdrop-blur-md px-2 py-1 rounded-2xl">
                  {(tags) => t.rich("titleLower", tags)}
                </RichText>
              </span>
            </h2>
          )}
          <p className="text-2xl my-6 text-center">
            <RichText>{(tags) => t.rich("description", tags)}</RichText>
          </p>
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
