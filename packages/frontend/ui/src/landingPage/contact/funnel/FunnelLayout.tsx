import { useTranslations } from "next-intl";
import { RichText } from "@com.synergy/frontend-ui/RichText";
import HeroLogoCta from "../../shared/heroes/HeroLogoCta";
import QualityChecklist from "../../shared/quality/QualityChecklist";

/* eslint-disable-next-line */
export interface FunnelLayoutProps {
  children: React.ReactNode;
}

/**
 * Seite „PV Montage buchen“ – im neuen SYNERGIE-Design:
 * Kopfzeile wie auf den anderen Seiten, darunter das Buchungsformular,
 * am Ende „Nächste Schritte“ und der Held mit Logo-Platzhalter.
 */
export const FunnelLayout = (props: FunnelLayoutProps) => {
  const t = useTranslations("LandingPage.ContactUs.Funnel.Header");

  return (
    <>
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-synergy-light-grey/60 before:-z-10">
        <div className="pt-32 pb-12">
          <div className="px-4 sm:px-6">
            {/* Page header */}
            <div className="max-w-3xl mx-auto text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-synergy-light-blue">
                {t("eyebrow")}
              </p>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wide text-synergy-dark-grey">
                {t("title")}
              </h1>
              <div className="w-16 h-1 bg-synergy-light-blue mt-4 mb-6 mx-auto" />
              <div className="text-lg text-synergy-dark-grey">
                <RichText>{(tags) => t.rich("description", tags)}</RichText>
              </div>
            </div>

            {/* Form */}
            {props.children}
          </div>
        </div>
      </section>
      <QualityChecklist section="contact" hero="synergie-heldin" numbered />
      <HeroLogoCta hero="logo-heldin-orange" className="pb-16" />
    </>
  );
};

export default FunnelLayout;
