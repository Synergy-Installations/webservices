import Counter from "../../../shared/animations/counter/Counter";
import { useMessages, useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface AboutStatsProps {}

export const AboutStats = (props: AboutStatsProps) => {
  const t = useTranslations("LandingPage.About.Stats");
  const messages = useMessages();
  const stats =
    ((messages as any)?.LandingPage?.About?.Stats?.items as Record<
      string,
      { value: number; suffix?: string; label: string }
    >) || {};
  const entries = Object.keys(stats).map((key) => ({
    id: key,
    ...stats[key],
  }));

  return (
    <section className="-translate-y-1/2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-synergy-light-blue py-3 sm:py-6 shadow-xl rounded-2xl">
            <ul className="flex">
              {entries.map((entry, index) => (
                <li
                  key={entry.id}
                  className="relative w-1/3 px-1 text-center after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:translate-x-px after:w-0.5 after:h-16 after:bg-synergy-light-grey after:hidden sm:after:block last:after:hidden"
                >
                  <div className="text-4xl !-tracking-[0.01em] md:text-5xl font-inter font-bold text-white mb-2">
                    <Counter number={entry.value} duration={2000} />
                    {entry.suffix}
                  </div>
                  <div className="text-base sm:text-sm md:text-base text-synergy-light-grey font-medium break-all">
                    {entry.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
