/* eslint-disable-next-line */
export interface PhotovoltaicHeroProps {}

export const PhotovoltaicHero = (props: PhotovoltaicHeroProps) => {
  return (
    <section
      className="relative h-full min-h-[500px] bg-cover bg-center"
      style={{ backgroundImage: "url('/images/Banner-Badsanierung.webp')" }}
    >
      <div className="bg-teal-500/40 flex flex-col items-center justify-between text-white text-center px-4 pt-32 pb-12">
        <div>
          <h2 className="text-4xl font-bold mb-2">Ihr neues Bad:</h2>
          <h2 className="text-4xl font-bold mb-4">
            sicher, barrierefrei, stilvoll
          </h2>
          <p className="text-lg mb-6 max-w-2xl">
            Ein modernes, barrierefreies Bad schenkt Ihnen nicht nur Komfort,
            sondern auch das gute Gefühl, an morgen gedacht zu haben.
          </p>
        </div>
        <a
          href={`mailto:office@synergiemontagen.eco?subject=Neue Anfrage&body=Guten Tag,%0D%0A%0D%0Ahiermit gebe ich meine Anforderungen und Wünsche bekannt:%0D%0A%0D%0ALeistungsgröße: %0D%0AVerbrauch: %0D%0ASpeicher: Ja/Nein %0D%0AInstallationsort: %0D%0ASonstige Wünsche: %0D%0A%0D%0AMeine Kontaktdaten sind: %0D%0AName: %0D%0ATelefonnummer: %0D%0A%0D%0AFG`}
          className="border border-white py-2 mt-20 px-4 rounded-md hover:bg-white hover:text-teal-500 transition"
        >
          Kostenlose Vor-Ort-Beratung vereinbaren
        </a>
      </div>
    </section>
  );
};

export default PhotovoltaicHero;
