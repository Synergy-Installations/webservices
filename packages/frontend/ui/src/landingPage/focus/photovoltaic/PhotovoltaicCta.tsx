import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { useTranslations } from "next-intl";
import RichText from "../../../shared/internationalization/text/RichText";

/* eslint-disable-next-line */
export interface PhotovoltaicCtaProps {
  translationProduct: string;
}

export const PhotovoltaicCta = (props: PhotovoltaicCtaProps) => {
  const { translationProduct } = props;
  const t = useTranslations(`LandingPage.Focus.${translationProduct}.Cta`);

  return (
    <section className="bg-gradient-to-r from-synergy-blue to-synergy-light-blue text-black text-center pt-16 pb-6 px-6 rounded-lg shadow-lg">
      <h2 className="text-3xl max-w-4xl mx-auto font-extrabold mb-6">
        <RichText>{(tags) => t.rich("title", tags)}</RichText>
      </h2>
      <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none w-fit sm:justify-center mb-6">
        <a
          className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line"
          href={`/kontakt`}
        >
          <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line">
            {/* {t("button.text")} */}
            {t("button.text")}
            <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
              <div className=" whitespace-nowrap">{"->"}</div>
            </div>
          </span>
        </a>
      </div>
      <p className="mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
        <RichText>{(tags) => t.rich("description", tags)}</RichText> <br />
        <br /> Sichern Sie sich Ihren Termin gleich per Telefon{" "}
        <a
          href="tel:+436642448742"
          className="underline hover:text-synergy-yellow"
        >
          +43 664 244 87 42
        </a>
        {", "}
        über unser{" "}
        <Link className="underline hover:text-synergy-yellow" href="/kontakt">
          Online-Formular
        </Link>{" "}
        oder per E-Mail{" "}
        <a
          href={`mailto:office@synergie.cc?subject=Neue Anfrage&body=Guten Tag,%0D%0A%0D%0Ahiermit gebe ich meine Anforderungen und Wünsche bekannt:%0D%0A%0D%0ALeistungsgröße: %0D%0AVerbrauch: %0D%0ASpeicher: Ja/Nein %0D%0AInstallationsort: %0D%0ASonstige Wünsche: %0D%0A%0D%0AMeine Kontaktdaten sind: %0D%0AName: %0D%0ATelefonnummer: %0D%0A%0D%0AFG`}
          className="underline hover:text-synergy-yellow"
        >
          office@synergie.cc
        </a>
        .
      </p>
    </section>
  );
};

export default PhotovoltaicCta;
