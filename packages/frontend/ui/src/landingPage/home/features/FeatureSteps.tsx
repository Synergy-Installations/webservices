import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import ModalVideo from "@com.synergy/frontend-ui/ModalVideo";
import VideoThumb from "../../../shared/images/scenic-house.jpg";

/* eslint-disable-next-line */
export interface FeatureStepsProps {}

export const FeatureSteps = (props: FeatureStepsProps) => {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h2 className="h2 text-5xl font-extrabold font-cabinet-grotesk">
              In 4 Schritten zu Ihrem Energie-
              <br />
              und Haustechnik System
            </h2>
          </div>

          {/* Section image */}
          <div
            className="flex justify-center pb-12 md:pb-16"
            data-aos="fade-up"
          >
            <ModalVideo
              thumb={VideoThumb}
              thumbWidth={768}
              thumbHeight={432}
              thumbAlt="Modal video thumbnail"
              video="/videos/product-hero-video.mp4"
              videoWidth={1920}
              videoHeight={1080}
            />
          </div>

          {/* Steps */}
          <div className="relative pb-12">
            {/* Line */}
            <div className="hidden lg:block absolute top-4 left-32 right-32 mt-px h-0.5 bg-synergy-light-grey" />

            {/* Grid */}
            <div className="relative z-10 max-w-sm mx-auto grid gap-12 sm:grid-cols-2 sm:max-w-3xl lg:grid-cols-4 lg:max-w-none items-start">
              {/* #1 */}
              <div className="text-center">
                <div className="w-9 h-9 backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue border-2 border-white text-white text-[15px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="font-cabinet-grotesk font-bold text-lg">
                  Personalised Outreach
                </h3>
                <div className="text-synergy-dark-grey">
                  Work is is changing faster than at any other time in history.
                </div>
              </div>

              {/* #2 */}
              <div className="text-center">
                <div className="w-9 h-9 backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue border-2 border-white text-white text-[15px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="font-cabinet-grotesk font-bold text-lg">
                  Personalised Outreach
                </h3>
                <div className="text-synergy-dark-grey">
                  Work is is changing faster than at any other time in history.
                </div>
              </div>

              {/* #3 */}
              <div className="text-center">
                <div className="w-9 h-9 backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue border-2 border-white text-white text-[15px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="font-cabinet-grotesk font-bold text-lg">
                  Personalised Outreach
                </h3>
                <div className="text-synergy-dark-grey">
                  Work is is changing faster than at any other time in history.
                </div>
              </div>

              {/* #4 */}
              <div className="text-center">
                <div className="w-9 h-9 backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue border-2 border-white text-white text-[15px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                  4
                </div>
                <h3 className="font-cabinet-grotesk font-bold text-lg">
                  Personalised Outreach
                </h3>
                <div className="text-synergy-dark-grey">
                  Work is is changing faster than at any other time in history.
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              className="btn !rounded-xl !py-4 !text-base backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue shadow-xl text-white group"
              href="/request-demo"
            >
              <span className="inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                Jetzt Anfragen
                <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                  {"->"}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSteps;
