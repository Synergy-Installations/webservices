import { useMessages, useTranslations } from "next-intl";
import RichText from "../../../shared/internationalization/text/RichText";
import Image from "next/image";
import ImageLoader from "../../../shared/utils/image/ImageLoader";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";

/* eslint-disable-next-line */
export interface ServiceComponentsProps {
  translationService: string;
  translationSubService: string;
}

export const ServiceComponents = (props: ServiceComponentsProps) => {
  const { translationService, translationSubService } = props;
  const messages: any = useMessages();
  const t = useTranslations(
    `LandingPage.B2B.Services.${translationService}.SubServices.${translationSubService}`
  );

  const benefits = Object.keys(
    messages.LandingPage.B2B.Services[translationService].SubServices[
      translationSubService
    ].Components.boxes
  );

  return (
    <>
      <section className="pt-12 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("Components.titleOne")}</h1>
        <div className=" max-w-2xl mx-auto text-lg">
          <RichText>
            {(tags) => t.rich("Components.descriptionOne", tags)}
          </RichText>
        </div>
        <div className="w-24 h-1 bg-teal-500 mx-auto my-4"></div>
        <div className=" max-w-2xl mx-auto text-lg">
          <RichText>
            {(tags) => t.rich("Components.descriptionTwo", tags)}
          </RichText>
        </div>
      </section>
      {/* <section className="p-12 text-center px-4">
        <h1 className="text-3xl font-bold mb-4">{t("titleTwo")}</h1>
        <div className="w-24 h-1 bg-teal-500 mx-auto mb-4"></div>
      </section> */}
      <section className="pt-12 px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-8 shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-synergy-light-blue text-white rounded-full">
                <Image
                  loader={ImageLoader}
                  src={t(`Components.boxes.${benefit}.icon.src`)}
                  alt={t(`Components.boxes.${benefit}.icon.alt`)}
                  width={Number(t(`Components.boxes.${benefit}.icon.width`))}
                  height={Number(t(`Components.boxes.${benefit}.icon.height`))}
                  className="text-white"
                />
                {/* <benefit.Icon className="w-8 h-8" /> */}
              </div>
              <h5 className="text-xl font-semibold mb-3 text-gray-800 text-center">
                {t(`Components.boxes.${benefit}.title`)}
              </h5>
              <p className="text-gray-600 text-center">
                {t(`Components.boxes.${benefit}.description`)}
              </p>
            </div>
          ))}
        </div>
        {/* <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none w-fit sm:justify-center">
          <Link
            className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line"
            href={t("Components.button.href")}
          >
            <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line">
              {t("Components.button.text")}
              <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                <div className=" whitespace-nowrap">{"->"}</div>
              </div>
            </span>
          </Link>
        </div> */}
      </section>
    </>
  );
};

export default ServiceComponents;
