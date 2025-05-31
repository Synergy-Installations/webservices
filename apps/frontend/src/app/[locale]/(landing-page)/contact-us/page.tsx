import { ContactBlocks } from "@com.synergy/frontend-ui/ContactBlocks";
import { ContactCommunity } from "@com.synergy/frontend-ui/ContactCommunity";
import { Form } from "@com.synergy/frontend-ui/Form";
import RichText from "@com.synergy/frontend-ui/RichText";
import { useTranslations } from "next-intl";

export default function Page(): JSX.Element {
  const t = useTranslations("LandingPage.ContactUs.Header");

  return (
    <>
      {/* Demo form */}
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-slate-100 before:-z-10">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="px-4 sm:px-6">
            {/* Page header */}
            <div className="max-w-5xl mx-auto text-center pb-12 md:pb-16 overflow-hidden">
              {/* <h1 className="font-inter-tight text-4xl md:text-5xl font-bold text-slate-900 pb-8 break-words hyphens-auto">
                <RichText>{(tags) => t.rich("title", tags)}</RichText>
              </h1>
              <div className="flex justify-center items-center mb-4">
                <div className="relative flex items-center">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full w-0 h-0 border-t-[1.47em] border-t-transparent border-b-[1.47em] border-b-transparent border-r-[1.47em] border-r-synergy-light-blue"></div>
                  <h2 className="font-inter-tight text-2xl md:text-3xl text-slate-90 font-medium py-1 bg-synergy-light-blue text-white break-words hyphens-auto">
                    <RichText>{(tags) => t.rich("smallTitle", tags)}</RichText>
                  </h2>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full w-0 h-0 border-t-[1.47em] border-t-transparent border-b-[1.47em] border-b-transparent border-l-[1.47em] border-l-synergy-light-blue"></div>
                </div>
              </div> */}
              <div className="items-center justify-center text-3xl md:text-5xl font-bold text-slate-900 mb-8 inline-flex bg-synergy-light-blue/20 px-6 pt-2 rounded-2xl">
                <span className="grid lg:flex gap-2 text-[#90979c] translate-y-[6px] whitespace-nowrap">
                  Ihre Energieautarkie{" "}
                  <span className="text-white">wir machens einfach.</span>
                </span>
              </div>

              <div className="text-lg text-slate-500">
                <RichText>{(tags) => t.rich("description", tags)}</RichText>
              </div>
            </div>

            {/* Form */}
            <Form />
          </div>
        </div>
      </section>

      <ContactBlocks />
      {/* <ContactCommunity /> */}
    </>
  );
}
