import Image from "next/image";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface B2bServiceSectionProps {}

const services = [
  {
    title: "Photovoltaik-Installationen",
    desc: "Modulare PV-Systeme für Gewerbedächer und Freiflächen",
    icon: "/frontend/landingPage/icons/solar-panel-sun_15865230%20blau.svg",
  },
  {
    title: "Wärmepumpen",
    desc: "Effiziente Luft- und Erdwärmepumpenlösungen",
    icon: "/icons/heatpump.svg",
  },
  {
    title: "Klimaanlagen",
    desc: "Industrielle & gewerbliche Klimaanlagen",
    icon: "/icons/ac.svg",
  },
  {
    title: "Wallbox & E-Mobilität",
    desc: "Zukunftssichere Ladeinfrastruktur",
    icon: "/icons/wallbox.svg",
  },
];

export const B2bServiceSection = (props: B2bServiceSectionProps) => {
  return (
    <section id="services" className="container mx-auto px-6 lg:px-0 py-20">
      <div className="text-center mb-12" data-aos="fade-up">
        <p className="text-green-600 font-semibold uppercase">Leistungen</p>
        <h2 className="text-3xl md:text-4xl font-bold">Unser B2B Portfolio</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((s, i) => (
          <div
            key={s.title}
            className="group border rounded-xl p-6 bg-white hover:shadow-xl cursor-pointer"
            data-aos="zoom-in"
            data-aos-delay={i * 100}
          >
            <Image
              loader={ImageLoader}
              src={s.icon}
              alt={s.title}
              width={48}
              height={48}
              className="h-12 mb-4 group-hover:rotate-12 transition-transform"
            />
            <h3 className="font-semibold text-xl mb-2 group-hover:text-green-600 transition-colors">
              {s.title}
            </h3>
            <p className="text-gray-600 text-sm md:text-base">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default B2bServiceSection;
