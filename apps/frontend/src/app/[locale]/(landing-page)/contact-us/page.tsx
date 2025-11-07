import { ContactBlocks } from "@com.synergy/frontend-ui/ContactBlocks";
import { ContactCommunity } from "@com.synergy/frontend-ui/ContactCommunity";
import { Form } from "@com.synergy/frontend-ui/Form";
import RichText from "@com.synergy/frontend-ui/RichText";
import { AuroraText } from "@com.synergy/frontend-ui/AuroraText";
import { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Kontakt – Synergie Montagen Riegler GmbH",
  description:
    "Kontaktieren Sie uns: Büro Wien, Telefon +43 664 244 8742, office@synergie.cc – Ihr Fachbetrieb für nachhaltige Haustechnik.",
  keywords: [
    "Kontakt",
    "Wien",
    "Anfrage",
    "Telefon",
    "E-Mail",
    "Synergie Montagen",
  ],
  alternates: {
    canonical: "https://synergie.cc/kontakt",
  },
};

export default function Page(): JSX.Element {
  const t = useTranslations("LandingPage.ContactUs.Header");

  return (
    <>
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-slate-100 before:-z-10">
        <div className="pb-12 md:pb-20">
          <div className="px-4 sm:px-6">
            {/* Page header */}
            <div className="max-w-7xl mx-auto min-[350px]:px-4 md:px-8 py-10 pt-20 xs:pt-28 md:pt-32">
              <header className="mb-4 md:mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-normal">
                  Ihre <AuroraText>Energieautarkie</AuroraText>{" "}
                  <div className="block sm:hidden"></div> wir machens einfach.
                </h1>
                <h2 className="text-2xl md:text-3xl text-synergy-dark-grey text-slate-90 font-bold py-4 break-words hyphens-auto">
                  <RichText>{(tags) => t.rich("description", tags)}</RichText>
                </h2>
              </header>
            </div>

            {/* Form */}
            <Form />
          </div>
        </div>
      </section>

      {/* <ContactBlocks /> */}
      {/* <ContactCommunity /> */}
    </>
  );
}
