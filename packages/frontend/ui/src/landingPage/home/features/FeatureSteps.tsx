import { useMessages, useTranslations } from "next-intl";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import HeroImage from "../../shared/heroes/HeroImage";
import { CheckBox } from "../../shared/quality/QualityChecklist";

/* eslint-disable-next-line */
export interface FeatureStepsProps {}

/**
 * „In drei Schritten zu Ihrem optimalen Projektabschluss“
 * mit SYNERGIE-Held (aktuelles Logo) und einer kleinen Qualitäts-Checkliste.
 */
export const FeatureSteps = (props: FeatureStepsProps) => {
  const t = useTranslations("LandingPage.Home.FeatureSteps");
  const th = useTranslations("LandingPage.Shared.Heroes");

  const messages: any = useMessages();
  const stepKeys = Object.keys(messages.LandingPage.Home.FeatureSteps.steps);
  const quality: string[] = messages?.LandingPage?.Shared?.Quality?.home || [];

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-16">
          <div className="grid items-center gap-10 md:grid-cols-[14rem_1fr] lg:gap-16">
            <HeroImage
              name="synergie-heldin"
              alt={th("synergieAlt")}
              className="mx-auto aspect-[2/3] w-40 md:w-56"
            />

            <div>
              {/* Section header */}
              <div className="text-center pb-10 md:pb-14">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide">
                  <RichText>{(tags) => t.rich("title", tags)}</RichText>
                </h2>
              </div>

              {/* Steps */}
              <div className="relative">
                {/* Line */}
                <div className="hidden sm:block absolute top-4 left-[16%] right-[16%] mt-px h-0.5 bg-synergy-light-grey" />

                <div className="relative z-10 grid gap-10 sm:grid-cols-3 items-start">
                  {stepKeys.map((key, index) => (
                    <div className="text-center" key={index}>
                      <div className="w-9 h-9 bg-synergy-light-blue shadow-md border-2 border-white text-white text-[15px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                        {t(`steps.${key}.number`)}
                      </div>
                      <h3 className="font-bold text-lg uppercase tracking-wide">
                        {t(`steps.${key}.title`)}
                      </h3>
                      {messages.LandingPage.Home.FeatureSteps.steps[key]
                        ?.description ? (
                        <div className="text-synergy-dark-grey">
                          {t(`steps.${key}.description`)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualitäts-Checkliste */}
              {quality.length > 0 ? (
                <ul className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3 rounded-2xl border border-synergy-light-grey bg-white px-6 py-5">
                  {quality.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-synergy-dark-grey"
                    >
                      <CheckBox />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSteps;
