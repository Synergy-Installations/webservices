import Features from "../../../shared/images/heat-pump-orange.jpg";
import Image from "next/image";
import Icon01 from "../../../shared/images/icon-01.svg";
import Icon02 from "../../../shared/images/icon-02.svg";
import Icon03 from "../../../shared/images/icon-03.svg";
import Icon04 from "../../../shared/images/icon-04.svg";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { useMessages, useTranslations } from "next-intl";
import ImageLoader from "@com.synergy/frontend-ui/ImageLoader";

/* eslint-disable-next-line */
export interface DefaultProductCardProps {
  productKey: string;
}

export const DefaultProductCard = (props: DefaultProductCardProps) => {
  const { productKey } = props;

  const t = useTranslations("LandingPage.Products.ProductCards");

  const messages: any = useMessages();

  const getProductBoxKeys = (boxKey: string) =>
    Object.keys(messages.LandingPage.Products.ProductCards[productKey][boxKey]);

  let orientationRight = t(`${productKey}.orientation`) === "right";

  return (
    <section className="mt-12 md:mt-20 mb-12 md:mb-20" data-aos-id-3>
      <div className="relative max-w-7xl mx-auto">
        {/* Bg */}
        <div
          className={`absolute inset-0 ${orientationRight ? "rounded-tr-[100px]" : "rounded-tl-[100px]"} mb-24 md:mb-0 bg-gradient-to-b from-synergy-light-grey pointer-events-none`}
          aria-hidden="true"
        />

        <div className="1pr-4 1sm:pr-6">
          <div className="">
            {/* Section content */}
            <div
              className={`relative max-w-xl mx-auto md:max-w-none text-center md:text-left flex flex-col gap-6 ${orientationRight ? "md:flex-row-reverse" : "md:flex-row"} items-center md:items-start justify-between`}
            >
              {/* Content */}
              <div
                className={`w-[512px] lg:w-[600px] max-w-full shrink-0 md:order-1 pb-6 pt-12 px-4 md:px-0 ${orientationRight ? "md:pl-10 lg:pl-16" : "md:pr-10 lg:pr-16"} md:pt-12`}
              >
                {/* Copy */}
                <h1 className="text-2xl font-black text-synergy-light-blue pb-1">
                  {t(`${productKey}.productIdentifier`)}
                </h1>
                <h2
                  className="h2 mb-4 text-4xl lg:text-5xl font-bold"
                  data-aos="fade-up"
                  data-aos-anchor="[data-aos-id-3]"
                  data-aos-delay="100"
                >
                  {t(`${productKey}.title`)}
                </h2>
                <p
                  className="text-lg text-slate-500 mb-8"
                  data-aos="fade-up"
                  data-aos-anchor="[data-aos-id-3]"
                  data-aos-delay="200"
                >
                  {t(`${productKey}.description`)}
                </p>

                {/* Button */}
                <div
                  className="max-w-xs mx-auto sm:max-w-none mb-8"
                  data-aos="fade-up"
                  data-aos-anchor="[data-aos-id-3]"
                  data-aos-delay="300"
                >
                  <div>
                    <Link
                      className="btn !rounded-xl !py-3 !text-base text-white backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue shadow-xl group"
                      href={t(`${productKey}.button.href`)}
                    >
                      <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                        {t(`${productKey}.button.text`)}
                        <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                          {"->"}
                        </span>
                      </span>
                      {/* <span className="inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                        Jetzt Anfragen
                        <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                          <svg
                            className="fill-current"
                            width="12"
                            height="10"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M1 6.002h7.586L6.293 8.295a1 1 0 1 0 1.414 1.414l4-4a1 1 0 0 0 0-1.416l-4-4a1 1 0 0 0-1.414 1.416l2.293 2.293H1a1 1 0 1 0 0 2Z" />
                          </svg>
                        </span>
                      </span> */}
                    </Link>
                  </div>
                </div>
                {/* Features blocks */}
                <div className="max-w-6xl mx-auto">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Blocks */}
                    {getProductBoxKeys("boxesTop").map((boxKey, index) => (
                      <div key={index}>
                        <div className="flex items-center mb-1">
                          <Image
                            className="shrink-0 fill-synergy-light-blue mr-2 opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                            loader={ImageLoader}
                            width={Number(
                              t(`${productKey}.boxesTop.${boxKey}.icon.width`)
                            )}
                            height={Number(
                              t(`${productKey}.boxesTop.${boxKey}.icon.height`)
                            )}
                            src={t(`${productKey}.boxesTop.${boxKey}.icon.src`)}
                            alt={t(`${productKey}.boxesTop.${boxKey}.icon.alt`)}
                          />
                          <h3 className="font-inter-tight font-semibold text-zinc-800">
                            {t(`${productKey}.boxesTop.${boxKey}.title`)}
                          </h3>
                        </div>
                        <p className="text-sm text-zinc-700">
                          {t(`${productKey}.boxesTop.${boxKey}.description`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image */}
              <div
                className={`max-w-sm md:max-w-none mt-3 ${orientationRight ? "mr-3" : "ml-4"}`}
              >
                <div className="relative -mx-8 md:mx-0">
                  <Image
                    loader={ImageLoader}
                    src={t(`${productKey}.image.src`)}
                    className={`ojbect-cover ${orientationRight ? "rounded-tr-[88px]" : "rounded-tl-[88px]"}`}
                    width={Number(t(`${productKey}.image.width`))}
                    height={Number(t(`${productKey}.image.height`))}
                    alt={t(`${productKey}.image.alt`)}
                  />
                </div>
              </div>
            </div>
            {/* Grid */}
            <div className="max-w-sm mx-auto md:px-16 grid mt-10 sm:grid-cols-2 sm:max-w-3xl lg:grid-cols-4 lg:max-w-none items-start">
              {/* #1 */}
              {getProductBoxKeys("boxesBottom").map((boxKey, index) => (
                <div
                  className="relative p-5 before:opacity-0 hover:before:opacity-20 before:absolute before:inset-0 before:rounded before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl before:transition-all before:duration-150 before:ease-in-out"
                  data-aos="fade-up"
                >
                  {/* <Image className="mb-3" src={Icon01} alt="Icon 01" /> */}
                  <Image
                    className="shrink-0 fill-synergy-light-blue mb-3 opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                    loader={ImageLoader}
                    width={Number(
                      t(`${productKey}.boxesBottom.${boxKey}.icon.width`)
                    )}
                    height={Number(
                      t(`${productKey}.boxesBottom.${boxKey}.icon.height`)
                    )}
                    src={t(`${productKey}.boxesBottom.${boxKey}.icon.src`)}
                    alt={t(`${productKey}.boxesBottom.${boxKey}.icon.alt`)}
                  />
                  <h3 className="font-cabinet-grotesk font-bold text-lg pb-1 text-slate-800">
                    {t(`${productKey}.boxesBottom.${boxKey}.title`)}
                  </h3>
                  <div className="text-slate-800 text-opacity-80">
                    {t(`${productKey}.boxesBottom.${boxKey}.description`)}
                  </div>
                </div>
              ))}

              {/* #2 */}
              {/* <div
                className="relative p-5 before:opacity-0 hover:before:opacity-20 before:absolute before:inset-0 before:rounded before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl before:transition-all before:duration-150 before:ease-in-out"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <Image className="mb-3" src={Icon02} alt="Icon 02" />
                <h3 className="font-cabinet-grotesk font-bold text-lg pb-1 text-slate-800">
                  Reward Performers
                </h3>
                <div className="text-slate-800 text-opacity-80">
                  No more endless task or wasted budget. With us, you and your
                  team are taken care of.
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DefaultProductCard;
