import Image from "next/image";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface B2bCompetenciesSectionProps {}

export const B2bCompetenciesSection = (props: B2bCompetenciesSectionProps) => {
  const competencies = [
    {
      title: "Planung, Beratung und Kundenservice",
      icon: "/frontend/landingPage/icons/clinical_notes_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg",
    },
    {
      title: "Installation, Montage und Materialbeschaffung",
      icon: "/frontend/landingPage/icons/build_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg",
    },
    {
      title: "Projektmanagement, Qualitätssicherung",
      icon: "/frontend/landingPage/icons/view_timeline_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg",
    },
    {
      title: "After-Sales-Services",
      icon: "/frontend/landingPage/icons/concierge_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg",
    },
  ];

  return (
    <section id="competencies" className="container mx-auto px-6 lg:px-0 py-20">
      <div className="text-center mb-12" data-aos="fade-up">
        <p className="text-synergy-light-blue font-semibold uppercase">
          Kernkompetenzen
        </p>
        <h2 className="text-3xl md:text-4xl font-bold">
          Unser Leistungsportfolio im Überblick
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {competencies.map((c, i) => (
          <div
            key={c.title}
            className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
            data-aos="fade-up"
            data-aos-delay={i * 100}
          >
            <Image
              loader={ImageLoader}
              width={48}
              height={48}
              src={c.icon}
              alt={c.title}
              className="h-12 mb-4"
            />
            <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default B2bCompetenciesSection;
