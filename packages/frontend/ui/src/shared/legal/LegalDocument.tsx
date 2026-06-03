import { useMessages, useTranslations } from "next-intl";
import RichText from "../internationalization/text/RichText";

/* eslint-disable-next-line */
export interface LegalDocumentProps {
  documentKey: "Impressum" | "Datenschutz" | "Nutzungsbedingungen";
}

export const LegalDocument = (props: LegalDocumentProps) => {
  const { documentKey } = props;

  const t = useTranslations(`LandingPage.Legal.${documentKey}`);
  const messages: any = useMessages();
  const documentMessages = messages?.LandingPage?.Legal?.[documentKey] ?? {};
  const sectionKeys = Object.keys(documentMessages.sections || {});
  const introBlockKeys = Object.keys(documentMessages.intro || {});

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 xs:pt-28 sm:px-6 lg:pt-32">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-max rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:sticky lg:top-28">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Inhaltsverzeichnis
          </h2>
          <nav className="mt-3">
            <ul className="space-y-2">
              {sectionKeys.map((sectionKey) => (
                <li key={`toc-${sectionKey}`}>
                  <a
                    href={`#${sectionKey}`}
                    className="text-sm leading-6 text-slate-600 transition-colors hover:text-slate-900"
                  >
                    {t(`sections.${sectionKey}.title`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <header className="border-b border-slate-200 pb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t("title")}
            </h1>
            {documentMessages.updatedAt && (
              <p className="mt-3 text-sm text-slate-500">{t("updatedAt")}</p>
            )}
          </header>

          {introBlockKeys.length > 0 && (
            <div className="mt-8 space-y-4">
              {introBlockKeys.map((blockKey) => (
                <RichText
                  key={`intro-${blockKey}`}
                  className="m-0 leading-7 text-slate-700"
                >
                  {(tags) => t.rich(`intro.${blockKey}.text`, tags)}
                </RichText>
              ))}
            </div>
          )}

          <div className="mt-8 space-y-10">
            {sectionKeys.map((sectionKey) => {
              const sectionMessages =
                documentMessages.sections?.[sectionKey] ?? {};
              const blockKeys = Object.keys(sectionMessages.blocks || {});

              return (
                <section
                  key={sectionKey}
                  id={sectionKey}
                  className="scroll-mt-24"
                >
                  <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                    {t(`sections.${sectionKey}.title`)}
                  </h2>

                  <div className="mt-4 space-y-4">
                    {blockKeys.map((blockKey) => {
                      const blockType = t(
                        `sections.${sectionKey}.blocks.${blockKey}.type`,
                      );

                      if (blockType === "subheading") {
                        return (
                          <h3
                            key={blockKey}
                            className="pt-2 text-lg font-semibold text-slate-900"
                          >
                            {t(
                              `sections.${sectionKey}.blocks.${blockKey}.text`,
                            )}
                          </h3>
                        );
                      }

                      if (blockType === "list") {
                        const itemKeys = Object.keys(
                          sectionMessages.blocks?.[blockKey]?.items || {},
                        );

                        return (
                          <ul
                            key={blockKey}
                            className="list-disc space-y-2 pl-6 text-slate-700"
                          >
                            {itemKeys.map((itemKey) => (
                              <li key={itemKey} className="leading-7">
                                {t.rich(
                                  `sections.${sectionKey}.blocks.${blockKey}.items.${itemKey}`,
                                  {
                                    b: (chunks) => (
                                      <b className="font-semibold">{chunks}</b>
                                    ),
                                    i: (chunks) => (
                                      <i className="italic">{chunks}</i>
                                    ),
                                    br: () => <br />,
                                  },
                                )}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      return (
                        <RichText
                          key={blockKey}
                          className="m-0 leading-7 text-slate-700"
                        >
                          {(tags) =>
                            t.rich(
                              `sections.${sectionKey}.blocks.${blockKey}.text`,
                              tags,
                            )
                          }
                        </RichText>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </article>
      </div>
    </main>
  );
};

export default LegalDocument;
