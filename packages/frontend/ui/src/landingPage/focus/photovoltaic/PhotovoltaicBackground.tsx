/* eslint-disable-next-line */
export interface PhotovoltaicBackgroundProps {}

export const PhotovoltaicBackground = (props: PhotovoltaicBackgroundProps) => {
  return (
    <section className="bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-2xl font-bold text-teal-600 mb-4">
            Was Sie erwarten können:
          </h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Bodengleiche Dusche für sicheres Ein- und Aussteigen</li>
            <li>Haltegriffe und Sitzmöglichkeiten - unauffällig integriert</li>
            <li>Rutschfeste Fliesen und gute Beleuchtung</li>
            <li>
              Wohlfühl-Design mit hochwertigen, pflegeleichten Materialien
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-teal-600 mb-4">
            In 5 einfachen Schritten zum Traumbad:
          </h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Unverbindliches Beratungsgespräch bei Ihnen vor Ort</li>
            <li>Individuelle Planung – inkl. 3D-Visualisierung</li>
            <li>Festpreisangebot und Fördermittelberatung</li>
            <li>Schnelle, saubere Umsetzung – alles aus einer Hand</li>
            <li>Einzug in Ihr neues Bad in wenigen Tagen</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default PhotovoltaicBackground;
