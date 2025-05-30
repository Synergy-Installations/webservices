/* eslint-disable-next-line */
export interface PhotovoltaicCtaProps {}

export const PhotovoltaicCta = (props: PhotovoltaicCtaProps) => {
  return (
    <section className="bg-teal-600 text-white text-center py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">
        Warten war gestern – holen Sie sich jetzt Ihr konkretes Bad-Angebot.
      </h2>
      <p className="mb-6 max-w-2xl mx-auto">
        Sie wünschen sich ein barrierefreies, sicheres und komfortables Bad?
        Dann sind Sie bei uns genau richtig.
      </p>
      <a
        href="mailto:ff@team-werk.co.at"
        className="border border-white py-2 px-6 rounded hover:bg-white hover:text-teal-600 transition"
      >
        Jetzt kostenlose Vor-Ort-Beratung sichern
      </a>
    </section>
  );
};

export default PhotovoltaicCta;
