"use client";
import { useMessages, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

/* eslint-disable-next-line */
export interface B2bTestimonialSectionProps {}

export const B2bTestimonialSection = (props: B2bTestimonialSectionProps) => {
  const t = useTranslations("LandingPage.B2B.Testimonials");
  const messages = useMessages();
  const testimonialItems =
    ((messages as any)?.LandingPage?.B2B?.Testimonials?.items as Record<
      string,
      { quote: string; author: string }
    >) || {};
  const testimonials = useMemo(
    () =>
      Object.keys(testimonialItems).map((key) => ({
        id: key,
        ...testimonialItems[key],
      })),
    [testimonialItems]
  );

  const safeTestimonials =
    testimonials.length > 0
      ? testimonials
      : [{ id: "default", quote: "", author: "" }];

  const [index, setIndex] = useState(0);
  const activeTestimonial = safeTestimonials[index % safeTestimonials.length];
  const next = () =>
    setIndex((prev) => (prev + 1) % Math.max(safeTestimonials.length, 1));

  return (
    <section
      className="container mx-auto px-6 lg:px-0 pb-20 pt-16 relative"
      data-aos="fade-up"
    >
      <div className="text-center mb-6">
        {/* <p className="uppercase text-gray-500">Begleiter</p> */}
        <h2 className="text-3xl md:text-4xl font-bold">{t("title")}</h2>
      </div>
      <div
        className="max-w-2xl mx-auto text-center italic text-gray-700"
        data-aos="fade-up"
      >
        “{activeTestimonial.quote}”
        <p className="mt-4 font-semibold">— {activeTestimonial.author}</p>
      </div>
      {safeTestimonials.length > 1 && (
        <button
          onClick={next}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"
          data-aos="fade-left"
          aria-label={t("nextLabel")}
        >
          ➔
        </button>
      )}
    </section>
  );
};

export default B2bTestimonialSection;
