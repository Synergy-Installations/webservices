import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface PhotovoltaicTestimonialsProps {
  translationProduct: string;
}

const testimonials = [
  {
    name: "testimonialOne.author",
    text: "testimonialOne.text",
    link: {
      text: "testimonialOne.link.text",
      href: "testimonialOne.link.href",
    },
  },
  {
    name: "testimonialTwo.author",
    text: "testimonialTwo.text",
    link: {
      text: "testimonialTwo.link.text",
      href: "testimonialTwo.link.href",
    },
  },
  {
    name: "testimonialThree.author",
    text: "testimonialThree.text",
    link: {
      text: "testimonialThree.link.text",
      href: "testimonialThree.link.href",
    },
  },
];

export const PhotovoltaicTestimonials = (
  props: PhotovoltaicTestimonialsProps
) => {
  const { translationProduct } = props;
  const t = useTranslations(
    `LandingPage.Focus.${translationProduct}.Testimonials.testimonialsList`
  );

  return (
    <section className="bg-white py-12 px-4">
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial, i) => (
          <div
            key={i}
            className="p-6 border rounded-2xl shadow-lg bg-gray-50 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, starIndex) => (
                <svg
                  key={starIndex}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-yellow-500"
                >
                  <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.416 8.23L12 18.897l-7.416 4.603L6 15.27 0 9.423l8.332-1.268L12 .587z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-700 text-sm mb-4 italic">
              “{t(testimonial.text)}”
            </p>
            <p className="font-semibold text-lg text-gray-900">
              {t(testimonial.name)}
            </p>
            <a
              href={t(testimonial.link.href)}
              target="_blank"
              rel="noopener"
              className="text-teal-600 text-sm underline mt-2 inline-block"
            >
              {t(testimonial.link.text)}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PhotovoltaicTestimonials;
