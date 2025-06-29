"use client";
import { useState } from "react";

/* eslint-disable-next-line */
export interface B2bTestimonialSectionProps {}

const testimonials = [
  {
    quote:
      "Synergiemontagen hat unser Projekt termingerecht und in höchster Qualität realisiert.",
    author: "Mag. Thomas Berger, EnergieProfi GmbH",
  },
  {
    quote:
      "Durch die transparente Kommunikation fühlten wir uns stets gut informiert.",
    author: "Ing. Sabine Müller, GreenEnergy AG",
  },
];

export const B2bTestimonialSection = (props: B2bTestimonialSectionProps) => {
  const [index, setIndex] = useState(0);
  const { quote, author } = testimonials[index];
  const next = () => setIndex((index + 1) % testimonials.length);
  return (
    <section
      className="container mx-auto px-6 lg:px-0 py-20 relative"
      data-aos="fade-up"
    >
      <div className="text-center mb-6">
        <p className="uppercase text-gray-500">Begleiter</p>
        <h2 className="text-3xl md:text-4xl font-bold">
          After-Sales & Support
        </h2>
      </div>
      <div
        className="max-w-2xl mx-auto text-center italic text-gray-700"
        data-aos="fade-up"
      >
        “{quote}”<p className="mt-4 font-semibold">— {author}</p>
      </div>
      <button
        onClick={next}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"
        data-aos="fade-left"
      >
        ➔
      </button>
    </section>
  );
};

export default B2bTestimonialSection;
