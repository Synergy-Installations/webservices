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
    <div className="relative flex flex-wrap items-stretch justify-center py-6 gap-6 mt-4 z-20">
      {statsKeys.map((stat, index) => (
      <div
        key={index}
        className="flex flex-col items-center justify-start gap-2 py-4 rounded-2xl min-w-[220px] max-w-[260px] w-full"
      >
        <h4 className="font-inter-tight text-2xl md:text-3xl font-bold tabular-nums mb-2 text-center">
        <Counter number={Number(t(`${stat}.number`))} />
        {t(`${stat}.suffix`)}
        </h4>
        <p className="text-sm text-synergy-dark-grey text-center">
        {t(`${stat}.text`)}
        </p>
      </div>
      ))}
    </div>
  );
};

export default Stats;
