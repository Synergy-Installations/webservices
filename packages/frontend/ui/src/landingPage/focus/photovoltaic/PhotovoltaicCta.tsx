import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface PhotovoltaicCtaProps {}

export const PhotovoltaicCta = (props: PhotovoltaicCtaProps) => {
  const t = useTranslations("LandingPage.Focus.Photovoltaic.Cta");

  return (
    <section className="bg-gradient-to-r from-synergy-blue to-synergy-light-blue text-black text-center py-16 px-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold mb-6">{t("title")}</h2>
      <p className="mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
        {t("description")} <br />
        <br /> Sichern Sie sich Ihren Termin gleich per Telefon{" "}
        <a
          href="tel:+436508696436"
          className="underline hover:text-synergy-yellow"
        >
          +43 650 8696436
        </a>{" "}
        über unser{" "}
        <Link className="underline hover:text-synergy-yellow" href="/kontakt">
          Online-Formular
        </Link>{" "}
        oder per E-Mail{" "}
        <a
          href={`mailto:office@synergiemontagen.eco?subject=Neue Anfrage&body=Guten Tag,%0D%0A%0D%0Ahiermit gebe ich meine Anforderungen und Wünsche bekannt:%0D%0A%0D%0ALeistungsgröße: %0D%0AVerbrauch: %0D%0ASpeicher: Ja/Nein %0D%0AInstallationsort: %0D%0ASonstige Wünsche: %0D%0A%0D%0AMeine Kontaktdaten sind: %0D%0AName: %0D%0ATelefonnummer: %0D%0A%0D%0AFG`}
          className="underline hover:text-synergy-yellow"
        >
          office@synergiemontagen.eco
        </a>
        .
      </p>
      <a
        href={`mailto:office@synergiemontagen.eco?subject=Neue Anfrage&body=Guten Tag,%0D%0A%0D%0Ahiermit gebe ich meine Anforderungen und Wünsche bekannt:%0D%0A%0D%0ALeistungsgröße: %0D%0AVerbrauch: %0D%0ASpeicher: Ja/Nein %0D%0AInstallationsort: %0D%0ASonstige Wünsche: %0D%0A%0D%0AMeine Kontaktdaten sind: %0D%0AName: %0D%0ATelefonnummer: %0D%0A%0D%0AFG`}
        className="border-0 text-center underline xs:no-underline xs:border-2 border-black xs:hover:border-synergy-light-blue text-black font-semibold py-3 px-0 xs:px-8 rounded-xl xs:hover:bg-synergy-light-blue xs:hover:text-white transition duration-300"
      >
        Jetzt kostenlose Vor-Ort-Beratung sichern
      </a>
    </section>
  );
};

export default PhotovoltaicCta;
