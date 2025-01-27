import Image from "next/image";
import Icon01 from "../../../shared/images/icon-01.svg";
import Icon02 from "../../../shared/images/icon-02.svg";
import Icon03 from "../../../shared/images/icon-03.svg";
import Icon04 from "../../../shared/images/icon-04.svg";
import Family from "../../../shared/images/Family.jpeg";
import { useMessages, useTranslations } from "next-intl";
import ImageLoader from "@com.synergy/frontend-ui/ImageLoader";

/* eslint-disable-next-line */
export interface AboutUsCardProps {}

export const AboutUsCard = (props: AboutUsCardProps) => {
  const t = useTranslations("LandingPage.Products.AboutUsCard");

  const messages: any = useMessages();
  const boxCardKeys = Object.keys(
    messages.LandingPage.Products.AboutUsCard.boxes
  );

  return (
    <section>
      <div className="relative max-w-7xl mx-auto">
        {/* Bg */}
        <div
          className="absolute inset-0 rounded-tr-[100px] bg-gradient-to-b from-synergy-light-grey pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20 md:pt-12">
            {/* Section content */}
            <div className="relative max-w-xl mx-auto md:max-w-none text-center md:text-left">
              {/* Section header */}
              <div className="md:max-w-3xl mb-12" data-aos="fade-up">
                <h1 className="text-2xl font-medium text-synergy-light-blue pb-1">
                  {t("cardIdentifier")}
                </h1>
                <h2 className="h2 text-4xl lg:text-5xl font-bold mb-4">
                  {t("title")}
                </h2>
                <p className="text-lg text-slate-700">{t("description")}</p>
              </div>

              {/* Items */}
              <div className="max-w-sm mx-auto grid sm:gap-4 lg:gap-0 sm:grid-cols-1 sm:max-w-4xl lg:grid-cols-3 lg:max-w-none items-start">
                {/* #1 */}
                {boxCardKeys.map((boxKey, index) => (
                  <div
                    className={`relative sm:flex ${index % 2 == 0 && "sm:flex-row-reverse"} sm:gap-4 md:gap-8 items-center justify-between lg:block p-5 mt-16 sm:mt-0 before:opacity-0 hover:before:opacity-20 before:absolute before:inset-0 before:rounded before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl before:transition-all before:duration-150 before:ease-in-out`}
                    data-aos="fade-up"
                    key={index}
                  >
                    <div className="relative min-w-[250px] w-full h-[230px] mb-6 sm:mb-0 lg:mb-16">
                      <Image
                        loader={ImageLoader}
                        className="object-cover rounded"
                        width={undefined}
                        height={undefined}
                        fill={true}
                        src={t(`boxes.${boxKey}.image.src`)}
                        alt="Family"
                      />
                    </div>
                    <div className="px-3">
                      <div className="mb-3 flex justify-center items-center w-full md:block">
                        <Image
                          className="shrink-0 fill-synergy-light-blue opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                          loader={ImageLoader}
                          width={Number(t(`boxes.${boxKey}.icon.width`))}
                          height={Number(t(`boxes.${boxKey}.icon.height`))}
                          src={t(`boxes.${boxKey}.icon.src`)}
                          alt={t(`boxes.${boxKey}.icon.alt`)}
                        />
                      </div>
                      <h3 className="font-cabinet-grotesk font-bold text-lg pb-1 text-slate-800">
                        {t(`boxes.${boxKey}.title`)}
                      </h3>
                      <div className="text-slate-800 text-opacity-80">
                        {t(`boxes.${boxKey}.description`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsCard;
