import { useMessages, useTranslations } from "next-intl";
import { Counter } from "@com.synergy/frontend-ui/Counter";

/* eslint-disable-next-line */
export interface StatsProps {}

export const Stats = (props: StatsProps) => {
  const t = useTranslations("LandingPage.Home.FeatureAdvantages.stats");

  const messages: any = useMessages();
  const statsKeys = Object.keys(
    messages.LandingPage.Home.FeatureAdvantages.stats
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="max-w-sm mx-auto grid gap-12 sm:grid-cols-2 md:grid-cols-4 md:-mx-5 md:gap-0 items-start md:max-w-none">
        {statsKeys.map((stat, index) => (
          <div key={index} className="relative text-center md:px-5">
            <h4 className="font-inter-tight text-2xl md:text-3xl font-bold tabular-nums mb-2">
              <Counter number={Number(t(`${stat}.number`))} />
              {t(`${stat}.suffix`)}
            </h4>
            <p className="text-sm text-synergy-dark-grey">
              {t(`${stat}.text`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
