import { BaseTestimonial } from "@com.synergy/frontend-ui/BaseTestimonial";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import { useMessages, useTranslations } from "next-intl";
import Image from "next/image";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import Marquee from "../../../shared/marquee/Marquee";
import isTrueSet from "../../../shared/utils/math/Boolean";

/* eslint-disable-next-line */
export interface TestimonialsCarouselProps {}

export const TestimonialsCarousel = (props: TestimonialsCarouselProps) => {
  const t = useTranslations("LandingPage.Home.TestimonialsCarousel");

  const messages: any = useMessages();
  const stepKeys = Object.keys(
    messages.LandingPage.Home.TestimonialsCarousel.testimonials
  );

  const blockKeys = Object.keys(
    messages.LandingPage.Home.TestimonialsCarousel.blocks
  );

  return (
    <section className="relative bg-synergy-light-grey before:pointer-events-none before:absolute before:inset-0 before:z-10 before:h-[120%] before:bg-gradient-to-b before:from-synergy-light-grey">
      <div className="pt-12 md:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold relative z-10">
              <RichText>{(tags) => t.rich("title", tags)}</RichText>
            </h2>
          </div>
        </div>
        <div className="relative mx-auto flex max-w-[94rem] justify-center">
          {/* <div
            className="absolute bottom-20 -translate-x-36"
            aria-hidden="true"
          >
            <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 to-gray-900 opacity-30 blur-[160px] will-change-[filter]" />
          </div>
          <div className="absolute -bottom-10" aria-hidden="true">
            <div className="h-80 w-80 rounded-full bg-blue-500 opacity-40 blur-[160px] will-change-[filter]" />
          </div>
          <div className="absolute bottom-0" aria-hidden="true">
            <div className="h-56 w-56 rounded-full border-[20px] border-white blur-[20px] will-change-[filter]" />
          </div> */}
          {/* Row */}
          <div className="group relative z-20 inline-flex w-full flex-nowrap py-12 [mask-image:_linear-gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)] md:py-20">
            <div className="flex items-start justify-center md:justify-start [&>*]:mx-3">
              {/* Items */}
              <Marquee
                pauseOnHoverProp={isTrueSet("true")}
                reverse={isTrueSet("true")}
                className="![--duration:60s] !overflow-visible"
              >
                {stepKeys.map((testimonial, index) => (
                  <BaseTestimonial
                    key={index}
                    testimonial={{
                      img: t(`testimonials.${testimonial}.profilePicture.src`),
                      name: t(`testimonials.${testimonial}.name`),
                      username: t(`testimonials.${testimonial}.username`),
                      imageAlt: t(
                        `testimonials.${testimonial}.profilePicture.src`
                      ),
                      usernameUrl: t(`testimonials.${testimonial}.usernameUrl`),
                      date: t(`testimonials.${testimonial}.date`),
                      channelIconSrc: t(
                        `testimonials.${testimonial}.channelIcon.src`
                      ),
                      channelIconAlt: t(
                        `testimonials.${testimonial}.channelIcon.alt`
                      ),
                      channelIconWidth: Number(
                        t(`testimonials.${testimonial}.channelIcon.width`)
                      ),
                      channelIconHeight: Number(
                        t(`testimonials.${testimonial}.channelIcon.height`)
                      ),
                    }}
                    className="w-[22rem] transition-transform duration-300 group-hover:rotate-0"
                  >
                    {t(`testimonials.${testimonial}.content`)}
                  </BaseTestimonial>
                ))}
              </Marquee>
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex items-start justify-center md:justify-start [&>*]:mx-3"
              aria-hidden="true"
            >
              <Marquee
                pauseOnHoverProp={isTrueSet("true")}
                reverse={isTrueSet("true")}
                className="![--duration:30s]"
              >
                {/* Items */}
                {stepKeys.map((testimonial, index) => (
                  <BaseTestimonial
                    key={index}
                    testimonial={{
                      img: t(`testimonials.${testimonial}.profilePicture.src`),
                      name: t(`testimonials.${testimonial}.name`),
                      username: t(`testimonials.${testimonial}.username`),
                      imageAlt: t(
                        `testimonials.${testimonial}.profilePicture.src`
                      ),
                      usernameUrl: t(`testimonials.${testimonial}.usernameUrl`),
                      date: t(`testimonials.${testimonial}.date`),
                      channelIconSrc: t(
                        `testimonials.${testimonial}.channelIcon.src`
                      ),
                      channelIconAlt: t(
                        `testimonials.${testimonial}.channelIcon.alt`
                      ),
                      channelIconWidth: Number(
                        t(`testimonials.${testimonial}.channelIcon.width`)
                      ),
                      channelIconHeight: Number(
                        t(`testimonials.${testimonial}.channelIcon.height`)
                      ),
                    }}
                    className="w-[22rem] transition-transform duration-300 group-hover:rotate-0"
                  >
                    {t(`testimonials.${testimonial}.content`)}
                  </BaseTestimonial>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
        {/* Blocks */}
        {/* <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 lg:pb-20 relative z-10">
            <div
            className={`grid gap-8 lg:gap-16 ${
              blockKeys.length === 2
              ? "sm:grid-cols-2 lg:grid-cols-2 justify-center"
              : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
            >
            {blockKeys.map((key, index) => (
              <div key={index}>
              <div className="flex items-center mb-1">
                <Image
                className="shrink-0 fill-synergy-light-blue mr-2 opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                loader={ImageLoader}
                width={Number(t(`blocks.${key}.icon.width`))}
                height={Number(t(`blocks.${key}.icon.height`))}
                src={t(`blocks.${key}.icon.src`)}
                alt={t(`blocks.${key}.icon.alt`)}
                />
                <h3 className="font-inter-tight font-semibold text-synergy-dark-grey">
                {t(`blocks.${key}.title`)}
                </h3>
              </div>
              <p className="text-sm text-synergy-dark-grey">
                {t(`blocks.${key}.description`)}
              </p>
              </div>
            ))}
            </div>
        </div> */}
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
