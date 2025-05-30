import {
  IconConsultation,
  IconUser,
  IconPlan,
} from "@com.synergy/frontend-ui/Icons";

/* eslint-disable-next-line */
export interface PhotovoltaicComponentsProps {}

const benefits = [
  {
    Icon: IconConsultation,
    title: "Persönliche Beratung vor Ort",
    text: "Wir planen direkt bei Ihnen zu Hause – einfach und individuell.",
  },
  {
    Icon: IconUser,
    title: "Feste Ansprechpartner",
    text: "Ein vertrautes Gesicht, das immer für Sie da ist.",
  },
  {
    Icon: IconPlan,
    title: "Fester Zeit- und Kostenplan",
    text: "Klare Abläufe, effiziente Prozesse und keine Überraschungen.",
  },
];

export const PhotovoltaicComponents = (props: PhotovoltaicComponentsProps) => {
  return (
    <>
      <section className="bg-white py-12 px-4">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map(({ Icon, title, text }, index) => (
            <div
              key={index}
              className="p-6 border border-gray-300 rounded-md text-center"
            >
              <Icon />
              <h5 className="text-xl font-semibold mt-4 mb-2">{title}</h5>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default PhotovoltaicComponents;
