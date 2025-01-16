import { BaseTestimonial } from "@com.synergy/frontend-ui/BaseTestimonial";
import TestimonialImg01 from "../../../shared/images/testimonial-01.jpg";
import TestimonialImg02 from "../../../shared/images/testimonial-02.jpg";
import TestimonialImg03 from "../../../shared/images/testimonial-03.jpg";
import TestimonialImg04 from "../../../shared/images/testimonial-04.jpg";

/* eslint-disable-next-line */
export interface TestimonialsCarouselProps {}

export const TestimonialsCarousel = (props: TestimonialsCarouselProps) => {
  const testimonials = [
    {
      img: TestimonialImg01,
      name: "Peter Lowe",
      username: "@peterlowex",
      date: "May 19, 2027",
      content:
        "As a founder, having a visually appealing and user-friendly website is essential. This tool not only helped me achieve that but also improved my site's performance and SEO.",
      channel: "Twitter",
    },
    {
      img: TestimonialImg02,
      name: "Rodri Alba",
      username: "@rodri_spn",
      date: "Apr 12, 2027",
      content:
        "Synergy has revolutionized the way I manage my work. Its intuitive interface and seamless functionality make staying organized effortless. I can't imagine my life without it.",
      channel: "Twitter",
    },
    {
      img: TestimonialImg03,
      name: "Michele Lex",
      username: "@MikyBrown",
      date: "Mar 04, 2027",
      content:
        "I've tried several website builders before, but none were as user-friendly and versatile as this one. From design to functionality, it exceeded my expectations!",
      channel: "Twitter",
    },
    {
      img: TestimonialImg04,
      name: "Michael Ross",
      username: "@michjack",
      date: "Jan 15, 2027",
      content:
        "Synergy lives up to its name in every way. It's incredibly easy to use yet powerful enough to handle all my tasks effortlessly. It's become an essential part of my daily routine.",
      channel: "Twitter",
    },
  ];

  return (
    <section className="relative bg-synergy-light-grey before:pointer-events-none before:absolute before:inset-0 before:z-10 before:h-[120%] before:bg-gradient-to-b before:from-synergy-light-grey">
      <div className="pt-12 md:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold md:text-4xl relative z-10">
              Unsere KundInnen sind <br />
              überzeugt
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
            <div className="flex animate-[infinite-scroll_60s_linear_infinite] items-start justify-center group-hover:[animation-play-state:paused] md:justify-start [&>*]:mx-3">
              {/* Items */}
              {testimonials.map((testimonial, index) => (
                <BaseTestimonial
                  key={index}
                  testimonial={testimonial}
                  className="w-[22rem] transition-transform duration-300 group-hover:rotate-0"
                >
                  {testimonial.content}
                </BaseTestimonial>
              ))}
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex animate-[infinite-scroll_60s_linear_infinite] items-start justify-center group-hover:[animation-play-state:paused] md:justify-start [&>*]:mx-3"
              aria-hidden="true"
            >
              {/* Items */}
              {testimonials.map((testimonial, index) => (
                <BaseTestimonial
                  key={index}
                  testimonial={testimonial}
                  cloned={true}
                  className="w-[22rem] transition-transform duration-300 group-hover:rotate-0"
                >
                  {testimonial.content}
                </BaseTestimonial>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 lg:pb-20 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16">
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
                <h3 className="font-inter-tight font-semibold text-synergy-dark-grey">
                  Discussions
                </h3>
              </div>
              <p className="text-sm text-synergy-dark-grey">
                Aus vielen technischen Möglichkeiten erhalten Sie Ihre optimale
                Planung für die passende Energicoptimierung. Innerhalb weniger
                Tage nach der Besichtigung erhalten Sie ein
                Full-Service-Angebot.
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
                <h3 className="font-inter-tight font-semibold text-synergy-dark-grey">
                  Team views
                </h3>
              </div>
              <p className="text-sm text-synergy-dark-grey">
                Keep workflows efficient with tools that give teams visibility
                throughout the process.
              </p>
            </div>
            {/* Block #3 */}
            <div>
              <div className="flex items-center mb-1">
                <svg
                  className="fill-synergy-light-blue mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="16"
                >
                  <path d="M13 0H1C.4 0 0 .4 0 1v14c0 .6.4 1 1 1h8l5-5V1c0-.6-.4-1-1-1ZM2 2h10v8H8v4H2V2Z" />
                </svg>
                <h3 className="font-inter-tight font-semibold text-synergy-dark-grey">
                  Powerful search
                </h3>
              </div>
              <p className="text-sm text-synergy-dark-grey">
                Keep workflows efficient with tools that give teams visibility
                throughout the process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
