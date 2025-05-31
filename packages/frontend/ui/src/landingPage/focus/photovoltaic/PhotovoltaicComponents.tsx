import {
  IconConsultation,
  IconRundumSorglosPaket,
  IconPreissicherheitGarantiert,
  IconMoney,
  IconUser,
  IconPlan,
  IconInMonaten,
} from "@com.synergy/frontend-ui/Icons";
import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface PhotovoltaicComponentsProps {}

const benefits = [
  {
    Icon: IconRundumSorglosPaket,
    title: "boxes.solar-panels.title",
    text: "boxes.solar-panels.description",
  },
  {
    Icon: IconMoney,
    title: "boxes.inverters.title",
    text: "boxes.inverters.description",
  },
  {
    Icon: IconPlan,
    title: "boxes.batteries.title",
    text: "boxes.solar-panels.description",
  },
];

export const PhotovoltaicComponents = (props: PhotovoltaicComponentsProps) => {
  const t = useTranslations("LandingPage.Focus.Photovoltaic.Components");

  return (
    <>
      <section className="py-12 text-center px-4">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <div className="w-24 h-1 bg-teal-500 mx-auto mb-4"></div>
        <p className="italic max-w-2xl mx-auto text-lg">{t("description")}</p>
      </section>
      <section className="py-12 px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-8 shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-synergy-light-blue text-white rounded-full">
                <benefit.Icon className="w-8 h-8" />
              </div>
              <h5 className="text-xl font-semibold mb-3 text-gray-800">
                {t(benefit.title)}
              </h5>
              <p className="text-gray-600">{t(benefit.text)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default PhotovoltaicComponents;
