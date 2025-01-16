import Features from "../../../shared/images/heat-pump-orange.jpg";
import Image from "next/image";
import Icon01 from "../../../shared/images/icon-01.svg";
import Icon02 from "../../../shared/images/icon-02.svg";
import Icon03 from "../../../shared/images/icon-03.svg";
import Icon04 from "../../../shared/images/icon-04.svg";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";

/* eslint-disable-next-line */
export interface DefaultProductCardProps {
  orientation?: "left" | "right";
}

export const DefaultProductCard = (props: DefaultProductCardProps) => {
  const { orientation = "right" } = props;
  let orientationRight = orientation === "right";

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
                  Photovoltaik
                </h1>
                <h2
                  className="h2 mb-4 text-4xl lg:text-5xl font-bold"
                  data-aos="fade-up"
                  data-aos-anchor="[data-aos-id-3]"
                  data-aos-delay="100"
                >
                  Sparen und unabhängig von Strompreis
                </h2>
                <p
                  className="text-lg text-slate-500 mb-8"
                  data-aos="fade-up"
                  data-aos-anchor="[data-aos-id-3]"
                  data-aos-delay="200"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua
                  minim veniam, quis nostrud exercitation.
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
                      href="apply.html"
                    >
                      <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                        Jetzt Anfragen
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
                    {/* Block #1 */}
                    <div>
                      <div className="flex items-center mb-1">
                        <svg
                          className="fill-synergy-light-blue mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                        >
                          <path d="M15 9a1 1 0 0 1 0 2c-.441 0-1.243.92-1.89 1.716.319 1.005.529 1.284.89 1.284a1 1 0 0 1 0 2 2.524 2.524 0 0 1-2.339-1.545A3.841 3.841 0 0 1 9 16a1 1 0 0 1 0-2c.441 0 1.243-.92 1.89-1.716C10.57 11.279 10.361 11 10 11a1 1 0 0 1 0-2 2.524 2.524 0 0 1 2.339 1.545A3.841 3.841 0 0 1 15 9Zm-5-1H7.51l-.02.142C6.964 11.825 6.367 16 3 16a3 3 0 0 1-3-3 1 1 0 0 1 2 0 1 1 0 0 0 1 1c1.49 0 1.984-2.48 2.49-6H3a1 1 0 1 1 0-2h2.793c.52-3.1 1.4-6 4.207-6a3 3 0 0 1 3 3 1 1 0 0 1-2 0 1 1 0 0 0-1-1C8.808 2 8.257 3.579 7.825 6H10a1 1 0 0 1 0 2Z" />
                        </svg>
                        <h3 className="font-inter-tight font-semibold text-zinc-800">
                          Discussions
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-700">
                        Keep workflows efficient with tools that give teams
                        visibility throughout the process.
                      </p>
                    </div>
                    {/* Block #2 */}
                    <div>
                      <div className="flex items-center mb-1">
                        <svg
                          className="fill-synergy-light-blue mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                        >
                          <path d="M13 16c-.153 0-.306-.035-.447-.105l-3.851-1.926c-.231.02-.465.031-.702.031-4.411 0-8-3.14-8-7s3.589-7 8-7 8 3.14 8 7c0 1.723-.707 3.351-2 4.63V15a1.003 1.003 0 0 1-1 1Zm-4.108-4.054c.155 0 .308.036.447.105L12 13.382v-2.187c0-.288.125-.562.341-.752C13.411 9.506 14 8.284 14 7c0-2.757-2.691-5-6-5S2 4.243 2 7s2.691 5 6 5c.266 0 .526-.02.783-.048a1.01 1.01 0 0 1 .109-.006Z" />
                        </svg>
                        <h3 className="font-inter-tight font-semibold text-zinc-800">
                          Team views
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-700">
                        Keep workflows efficient with tools that give teams
                        visibility throughout the process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div
                className={`max-w-sm md:max-w-none mt-3 ${orientationRight ? "mr-3" : "ml-4"}`}
              >
                <div className="relative -mx-8 md:mx-0">
                  <Image
                    src={Features}
                    className={`ojbect-cover ${orientationRight ? "rounded-tr-[88px]" : "rounded-tl-[88px]"}`}
                    width={undefined}
                    height={undefined}
                    alt="Features"
                  />
                </div>
              </div>
            </div>
            {/* Grid */}
            <div className="max-w-sm mx-auto md:px-16 grid mt-10 sm:grid-cols-2 sm:max-w-3xl lg:grid-cols-4 lg:max-w-none items-start">
              {/* #1 */}
              <div
                className="relative p-5 before:opacity-0 hover:before:opacity-20 before:absolute before:inset-0 before:rounded before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl before:transition-all before:duration-150 before:ease-in-out"
                data-aos="fade-up"
              >
                <Image className="mb-3" src={Icon01} alt="Icon 01" />
                <h3 className="font-cabinet-grotesk font-bold text-lg pb-1 text-slate-800">
                  Reward Performers
                </h3>
                <div className="text-slate-800 text-opacity-80">
                  No more endless task or wasted budget. With us, you and your
                  team are taken care of.
                </div>
              </div>

              {/* #2 */}
              <div
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
              </div>

              {/* #3 */}
              <div
                className="relative p-5 before:opacity-0 hover:before:opacity-20 before:absolute before:inset-0 before:rounded before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl before:transition-all before:duration-150 before:ease-in-out"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <Image className="mb-3" src={Icon03} alt="Icon 03" />
                <h3 className="font-cabinet-grotesk font-bold text-lg pb-1 text-slate-800">
                  Reward Performers
                </h3>
                <div className="text-slate-800 text-opacity-80">
                  No more endless task or wasted budget. With us, you and your
                  team are taken care of.
                </div>
              </div>

              {/* #4 */}
              <div
                className="relative p-5 before:opacity-0 hover:before:opacity-20 before:absolute before:inset-0 before:rounded before:bg-gradient-to-tr before:from-synergy-light-blue before:to-synergy-light-blue/25 before:shadow-xl before:transition-all before:duration-150 before:ease-in-out"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <Image className="mb-3" src={Icon04} alt="Icon 04" />
                <h3 className="font-cabinet-grotesk font-bold text-lg pb-1 text-slate-800">
                  Reward Performers
                </h3>
                <div className="text-slate-800 text-opacity-80">
                  No more endless task or wasted budget. With us, you and your
                  team are taken care of.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DefaultProductCard;
