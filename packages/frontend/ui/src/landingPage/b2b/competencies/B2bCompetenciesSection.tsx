import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface B2bCompetenciesSectionProps {}

export const B2bCompetenciesSection = (props: B2bCompetenciesSectionProps) => {
  const t = useTranslations("LandingPage.B2B.Competencies");
  const messages = useMessages();
  const competencyItems =
    ((messages as any)?.LandingPage?.B2B?.Competencies?.items as Record<
      string,
      { title: string; icon: string }
    >) || {};
  const competencies = Object.keys(competencyItems).map((key) => ({
    id: key,
    ...competencyItems[key],
  }));

  return (
    <section id="competencies" className="container mx-auto px-6 lg:px-0 pb-20 pt-12">
      <div className="text-center mb-12" data-aos="fade-up">
        <p className="text-synergy-light-blue font-semibold uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold">{t("title")}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {competencies.map((c, i) => (
          <div
            key={c.id}
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
