import Image from "next/image";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import Pricing01 from "../../../shared/images/heat-pump-orange.jpg";
import Pricing02 from "../../../shared/images/heat-pump-orange.jpg";
import Pricing03 from "../../../shared/images/heat-pump-orange.jpg";
import Pricing04 from "../../../shared/images/heat-pump-orange.jpg";
import { useMessages, useTranslations } from "next-intl";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import ImageLoader from "@com.synergy/frontend-ui/ImageLoader";

/* eslint-disable-next-line */
export interface PackagesCardProps {}

export const PackagesCard = (props: PackagesCardProps) => {
  const t = useTranslations("LandingPage.Products.PackagesCard");

  const messages: any = useMessages();
  const pricingTablesKeys = Object.keys(
    messages.LandingPage.Products.PackagesCard.pricingTables
  );
  const pricingTableFeaturesKeys = (pricingTableKey: string) =>
    Object.keys(
      messages.LandingPage.Products.PackagesCard.pricingTables[pricingTableKey]
        .features.list
    );

  return (
    <section>
      <div className="relative max-w-7xl mx-auto">
        {/* Bg */}
        <div
          className="absolute inset-0 rounded-tr-[100px] mb-24 md:mb-0 border-none border-slate-100 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 rounded-tr-[100px] mb-24 md:mb-0 bg-gradient-to-b from-synergy-light-grey pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20 md:pt-12">
            {/* Section content */}
            <div className="relative max-w-xl mx-auto md:max-w-none text-center md:text-left">
              {/* Section header */}
              <div className="md:max-w-3xl mb-12 md:mb-20" data-aos="fade-up">
                <h1 className="text-2xl font-medium text-synergy-light-blue pb-1">
                  {t("cardIdentifier")}
                </h1>
                <h2 className="h2 text-4xl font-bold mb-4">
                  <RichText>{(tags) => t.rich("title", tags)}</RichText>
                </h2>
                <p className="text-lg text-slate-500 mb-8">
                  {t("description")}
                </p>
              </div>

              {/* Pricing tables */}
              <div
                className="max-w-sm md:max-w-2xl 1xl:max-w-none mx-auto grid gap-8 md:grid-cols-2 1xl:grid-cols-4 xl:gap-6 items-start"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                {/* Pricing tables */}
                {pricingTablesKeys.map((pricingTableKey, index) => (
                  <div
                    className={`relative flex flex-col h-full ${t(`pricingTables.${pricingTableKey}.featured`) === "true" && "before:opacity-20 before:absolute before:inset-0 before:rounded-br-[100px] before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl"}  py-5 px-6`}
                    key={index}
                  >
                    {t(`pricingTables.${pricingTableKey}.label`) !== "" && (
                      <div
                        className={`absolute top-0 right-0 -translate-y-1/2 mr-6 inline-flex text-sm text-white bg-synergy-light-blue font-[550] rounded-full px-3 py-px`}
                      >
                        {t(`pricingTables.${pricingTableKey}.label`)}
                      </div>
                    )}
                    <div className="relative z-10">
                      <div className="mb-4">
                        <div className="text-lg font-bold text-center mb-3">
                          {t(`pricingTables.${pricingTableKey}.title`)}
                        </div>
                        <div className="relative h-[180px]">
                          <Image
                            loader={ImageLoader}
                            className="w-full rounded-lg object-cover"
                            src={t(
                              `pricingTables.${pricingTableKey}.image.src`
                            )}
                            width={undefined}
                            height={undefined}
                            fill={true}
                            alt={t(
                              `pricingTables.${pricingTableKey}.image.alt`
                            )}
                          />
                        </div>
                      </div>
                      <div className="mb-5">
                        <div className="text-2xl text-slate-800 font-bold text-center mb-4">
                          {t(`pricingTables.${pricingTableKey}.price`)}
                        </div>
                        <Link
                          className="btn !rounded-xl !py-3 !text-base text-white backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue shadow-xl w-full inline-flex items-center group"
                          href={t(
                            `pricingTables.${pricingTableKey}.button.href`
                          )}
                        >
                          <span className="inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                            {t(`pricingTables.${pricingTableKey}.button.text`)}
                            <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                              {"->"}
                            </span>
                          </span>
                        </Link>
                      </div>
                      <div className="text-slate-800 font-medium mb-4">
                        {t(`pricingTables.${pricingTableKey}.features.text`)}
                      </div>
                      <ul className="text-slate-500 text-left space-y-2">
                        {pricingTableFeaturesKeys(pricingTableKey).map(
                          (featureKey, index) => (
                            <li className="flex items-start" key={index}>
                              <Image
                                className="shrink-0 fill-synergy-light-blue mr-3 mt-1.5 opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                                loader={ImageLoader}
                                width={Number(
                                  t(
                                    `pricingTables.${pricingTableKey}.features.list.${featureKey}.icon.width`
                                  )
                                )}
                                height={Number(
                                  t(
                                    `pricingTables.${pricingTableKey}.features.list.${featureKey}.icon.height`
                                  )
                                )}
                                src={t(
                                  `pricingTables.${pricingTableKey}.features.list.${featureKey}.icon.src`
                                )}
                                alt={t(
                                  `pricingTables.${pricingTableKey}.features.list.${featureKey}.icon.alt`
                                )}
                              />
                              <span>
                                {t(
                                  `pricingTables.${pricingTableKey}.features.list.${featureKey}.text`
                                )}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PackagesCard;
