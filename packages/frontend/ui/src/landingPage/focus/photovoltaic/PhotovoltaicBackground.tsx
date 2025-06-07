import { useMessages, useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface PhotovoltaicBackgroundProps {}

export const PhotovoltaicBackground = (props: PhotovoltaicBackgroundProps) => {
  const t = useTranslations("LandingPage.Focus.Photovoltaic.Background");
  const messages: any = useMessages();
  const boxesLeftKeys = Object.keys(
    messages.LandingPage.Focus.Photovoltaic.Background.boxes.boxLeft.list
  );
  const boxesRightKeys = Object.keys(
    messages.LandingPage.Focus.Photovoltaic.Background.boxes.boxLeft.list
  );
  return (
    <section className="bg-gray-50 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mb-12">
        <div className="bg-yellow-200 p-6 rounded-lg shadow-lg transform">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            // fill="#e3e3e3"
            className="mx-auto mb-4 w-16 h-16 text-yellow-800"
          >
            <path
              fill="currentColor"
              d="m387-412 35-114-92-74h114l36-112 36 112h114l-93 74 35 114-92-71-93 71ZM240-40v-309q-38-42-59-96t-21-115q0-134 93-227t227-93q134 0 227 93t93 227q0 61-21 115t-59 96v309l-240-80-240 80Zm240-280q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70ZM320-159l160-41 160 41v-124q-35 20-75.5 31.5T480-240q-44 0-84.5-11.5T320-283v124Zm160-62Z"
            />
          </svg>
          <h3 className="text-xl font-bold text-center text-yellow-800 mb-4">
            {t("boxes.boxLeft.title")}
          </h3>
          <ul className="list-none list-inside space-y-2 text-yellow-900">
            {boxesLeftKeys.map((key) => (
              <li key={key}>
                <span className="mr-2">★</span>
                {t(`boxes.boxLeft.list.${key}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-teal-200 p-6 rounded-xl shadow-lg transform">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            // fill="#e3e3e3"
            className="mx-auto mb-4 w-16 h-16 text-teal-800"
          >
            <path
              fill="currentColor"
              d="M240-280h240v-80H240v80Zm120-160h240v-80H360v80Zm120-160h240v-80H480v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"
            />
          </svg>
          <h3 className="text-xl font-bold text-teal-800 mb-4">
            {t("boxes.boxRight.title")}
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-teal-900">
            {boxesRightKeys.map((key) => (
              <li key={key}>{t(`boxes.boxRight.list.${key}`)}</li>
            ))}
          </ol>
        </div>
      </div>
      <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none w-fit sm:justify-center">
        <a
          className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line"
          href={`/kontakt`}
        >
          <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line">
            {/* {t("button.text")} */}
            Jetzt kostenlose Vor-Ort-Beratung sichern
            <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
              <div className=" whitespace-nowrap">{"->"}</div>
            </div>
          </span>
        </a>
      </div>
    </section>
  );
};

export default PhotovoltaicBackground;
