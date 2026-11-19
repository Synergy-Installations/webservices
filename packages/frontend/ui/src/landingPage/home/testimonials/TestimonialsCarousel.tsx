import { BaseTestimonial } from "@com.synergy/frontend-ui/BaseTestimonial";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import { useMessages, useTranslations } from "next-intl";
import Marquee from "../../../shared/marquee/Marquee";
import isTrueSet from "../../../shared/utils/math/Boolean";
import type { GoogleReview } from "./googleReviews";

/* eslint-disable-next-line */
export interface TestimonialsCarouselProps {
  /** Live von Google geladene Bewertungen. Leer = hinterlegte Bewertungen zeigen. */
  googleReviews?: GoogleReview[];
}

const GOOGLE_ICON = {
  src: "/frontend/landingPage/icons/Google_%2522G%2522_logo.svg",
  alt: "Google Review",
  width: 20,
  height: 15,
};

export const TestimonialsCarousel = ({
  googleReviews = [],
}: TestimonialsCarouselProps) => {
  const t = useTranslations("LandingPage.Home.TestimonialsCarousel");
  const messages: any = useMessages();

  const items =
    googleReviews.length > 0
      ? googleReviews.map((r) => ({
          img:
            r.profilePhotoUrl ||
            "/frontend/landingPage/icons/Google_%2522G%2522_logo.svg",
          imageAlt: r.name,
          name: r.name,
          usernameUrl: r.profileUrl,
          username: "Google",
          content: r.text,
          channelIconSrc: GOOGLE_ICON.src,
          channelIconAlt: GOOGLE_ICON.alt,
          channelIconWidth: GOOGLE_ICON.width,
          channelIconHeight: GOOGLE_ICON.height,
        }))
      : Object.keys(
          messages.LandingPage.Home.TestimonialsCarousel.testimonials,
        ).map((key) => ({
          img: t(`testimonials.${key}.profilePicture.src`),
          imageAlt: t(`testimonials.${key}.name`),
          name: t(`testimonials.${key}.name`),
          username: t(`testimonials.${key}.username`),
          usernameUrl: "",
          content: t(`testimonials.${key}.content`),
          channelIconSrc: t(`testimonials.${key}.channelIcon.src`),
          channelIconAlt: t(`testimonials.${key}.channelIcon.alt`),
          channelIconWidth: Number(t(`testimonials.${key}.channelIcon.width`)),
          channelIconHeight: Number(
            t(`testimonials.${key}.channelIcon.height`),
          ),
        }));

  const renderRow = (duration: string, cloned: boolean) => (
    <Marquee
      pauseOnHoverProp={isTrueSet("true")}
      reverse={isTrueSet("true")}
      className={`${duration} !overflow-visible`}
    >
      {items.map(({ content, ...testimonial }, index) => (
        <BaseTestimonial
          key={index}
          testimonial={testimonial}
          cloned={cloned}
          className="w-[22rem] transition-transform duration-300 group-hover:rotate-0"
        >
          {content}
        </BaseTestimonial>
      ))}
    </Marquee>
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
          <div className="group relative z-20 inline-flex w-full flex-nowrap py-12 [mask-image:_linear-gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)] md:py-20">
            <div className="flex items-start justify-center md:justify-start [&>*]:mx-3">
              {renderRow("![--duration:60s]", false)}
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex items-start justify-center md:justify-start [&>*]:mx-3"
              aria-hidden="true"
            >
              {renderRow("![--duration:30s]", true)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
