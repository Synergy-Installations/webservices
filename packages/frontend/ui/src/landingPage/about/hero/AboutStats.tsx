import Counter from "../../../shared/animations/counter/Counter";

/* eslint-disable-next-line */
export interface AboutStatsProps {}

export const AboutStats = (props: AboutStatsProps) => {
  return (
    <section className="-translate-y-1/2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-synergy-light-blue py-3 sm:py-6 shadow-xl">
            <ul className="flex">
              <li className="relative w-1/3 px-1 text-center after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:translate-x-px after:w-0.5 after:h-16 after:bg-synergy-light-grey after:hidden sm:after:block last:after:hidden">
                <div className="text-4xl !-tracking-[0.01em] md:text-5xl font-inter font-bold text-white mb-2">
                  <Counter number={500} duration={2000} />+
                </div>
                <div className="text-xs sm:text-sm md:text-base text-synergy-light-grey font-medium">
                  Sonnenkraftprojekte realisiert
                </div>
              </li>
              <li className="relative w-1/3 px-1 text-center after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:translate-x-px after:w-0.5 after:h-16 after:bg-synergy-light-grey after:hidden sm:after:block last:after:hidden">
                <div className="text-4xl !-tracking-[0.01em] md:text-5xl font-inter font-bold text-white mb-2">
                  <Counter number={10000} duration={2000} />+
                </div>
                <div className="text-xs sm:text-sm md:text-base text-synergy-light-grey font-medium">
                  kW gesamte installierte Leistung
                </div>
              </li>
              <li className="relative w-1/3 px-1 text-center after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:translate-x-px after:w-0.5 after:h-16 after:bg-synergy-light-grey after:hidden sm:after:block last:after:hidden">
                <div className="text-4xl !-tracking-[0.01em] md:text-5xl font-inter font-bold text-white mb-2">
                  <Counter number={20} duration={2000} />+
                </div>
                <div className="text-xs sm:text-sm md:text-base text-synergy-light-grey font-medium">
                  Jahre in der Branche
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
