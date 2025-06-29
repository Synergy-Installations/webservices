"use client";
import { useState } from "react";

/* eslint-disable-next-line */
export interface B2bFaqSectionProps {}

function Accordion({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" data-aos="fade-up" data-aos-delay={index * 100}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 text-left"
      >
        <span className="font-semibold text-lg">{q}</span>
        <span className="text-2xl transform transition-transform">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <p className="pb-4 text-gray-600">{a}</p>}
    </div>
  );
}

const faqs = [
  {
    q: "Wie läuft die Projektabwicklung ab?",
    a: "Von der Analyse über Planung und Installation bis zum After-Sales nutzen wir digitale Tools, um transparente Prozesse zu gewährleisten.",
  },
  {
    q: "Welche Zertifizierungen haben Sie?",
    a: "Wir sind ISO-zertifiziert und arbeiten mit Herstellern nach höchsten Qualitätsstandards zusammen.",
  },
  {
    q: "Sind Sonderanfertigungen möglich?",
    a: "Ja, wir bieten individuelle Lösungen und maßgeschneiderte Komponenten für Ihr Projekt.",
  },
];

export const B2bFaqSection = (props: B2bFaqSectionProps) => {
  return (
    <section className="container mx-auto px-6 lg:px-0 py-20">
      <div className="text-center mb-12" data-aos="fade-up">
        <h2 className="text-3xl md:text-4xl font-bold">Häufige Fragen</h2>
      </div>
      <div className="max-w-2xl mx-auto space-y-4">
        {faqs.map((faq, i) => (
          <Accordion key={i} {...faq} index={i} />
        ))}
      </div>
    </section>
  );
};

export default B2bFaqSection;
