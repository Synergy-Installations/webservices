"use client";

import { AuroraText } from "@com.synergy/frontend-ui/AuroraText";
import { Form } from "@com.synergy/frontend-ui/Form";
import RichText from "@com.synergy/frontend-ui/RichText";
import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface PageContainerProps {
  storageZoneAccessKey?: string;
}

export const PageContainer = (props: PageContainerProps) => {
  const { storageZoneAccessKey } = props;
  const t = useTranslations("LandingPage.ContactUs.Header");

  const title = t.rich("title", {
    highlight: (chunks) => <AuroraText>{chunks}</AuroraText>,
    lineBreak: () => <div className="block sm:hidden" />,
  });

  return (
    <>
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-slate-100 before:-z-10">
        <div className="pb-12 md:pb-20">
          <div className="px-4 sm:px-6">
            <div className="max-w-7xl mx-auto min-[350px]:px-4 md:px-8 py-10 pt-20 xs:pt-28 md:pt-32">
              <header className="mb-4 md:mb-10 text-center">
                <p className="text-sm md:text-base font-semibold text-synergy-dark-grey uppercase tracking-wide mb-3">
                  {t("smallTitle")}
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-normal">
                  {title}
                </h1>
                <h2 className="text-2xl md:text-3xl text-synergy-dark-grey text-slate-90 font-bold py-4 break-words hyphens-auto">
                  <RichText>{(tags) => t.rich("description", tags)}</RichText>
                </h2>
              </header>
            </div>

            <Form STORAGE_ZONE_ACCESS_KEY={storageZoneAccessKey} />
          </div>
        </div>
      </section>
    </>
  );
};

export default PageContainer;
