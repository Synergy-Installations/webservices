/* eslint-disable-next-line */
export interface PhotovoltaicTestimonialsProps {}

const testimonials = [
  {
    name: "Mathias Primetshofer",
    text: "Team-Werk war einfach in jeder Hinsicht super! Tolle Planung, schnelle und zuverlässige Umsetzung...",
  },
  {
    name: "Michaela de Comtes",
    text: "Sehr freundliche und kompetente Beratung bei der Planung sowie perfekte Koordination...",
  },
  {
    name: "Selina Pammer",
    text: "Sehr freundlich, sehr kompetent, sehr aufgeschlossen unseren Vorstellungen gegenüber...",
  },
];

export const PhotovoltaicTestimonials = (
  props: PhotovoltaicTestimonialsProps
) => {
  return (
    <section className="bg-white py-12 px-4">
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div key={i} className="p-6 border rounded shadow-sm">
            <p className="text-sm mb-2 italic">“{t.text}”</p>
            <p className="font-bold mt-2">{t.name}</p>
            <a
              href="https://g.co/kgs/c2fje9C"
              target="_blank"
              rel="noopener"
              className="text-teal-600 text-sm underline"
            >
              Zur Rezension
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PhotovoltaicTestimonials;
