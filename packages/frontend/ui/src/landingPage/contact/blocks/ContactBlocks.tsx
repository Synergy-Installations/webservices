import { useMessages, useTranslations } from "next-intl";
import Image from "next/image";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import { RichText } from "@com.synergy/frontend-ui/RichText";

/* eslint-disable-next-line */
export interface ContactBlocksProps {}

export const ContactBlocks = (props: ContactBlocksProps) => {
  const t = useTranslations("LandingPage.ContactUs.ContactBlocks");

  const messages: any = useMessages();

  const contactBlockKeys = Object.keys(
    messages.LandingPage.ContactUs.ContactBlocks
  );

  return (
    <section id="end">
      <div className="pb-12 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-16 text-center">
            {/* Items */}
            {contactBlockKeys.map((contactBlockKey, index) => (
              <div key={index}>
                <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-md inline-flex items-center justify-center mb-3">
                  <Image
                    className="shrink-0 fill-synergy-light-blue opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                    loader={ImageLoader}
                    width={Number(t(`${contactBlockKey}.icon.width`))}
                    height={Number(t(`${contactBlockKey}.icon.height`))}
                    src={t(`${contactBlockKey}.icon.src`)}
                    alt={t(`${contactBlockKey}.icon.alt`)}
                  />
                </div>
                <h3 className="font-inter-tight font-semibold text-slate-800 mb-1">
                  {t(`${contactBlockKey}.title`)}
                </h3>
                <a
                  className="text-sm text-slate-500 underline"
                  href={t(`${contactBlockKey}.href`)}
                >
                  <RichText>
                    {(tags) =>
                      t.rich(`${contactBlockKey}.description`, {
                        ...tags,
                        lager: (chunks) => (
                          <a
                            href="https://maps.app.goo.gl/5muEKSBAzkPtgotu7"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {chunks}
                          </a>
                        ),
                      })
                    }
                  </RichText>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactBlocks;
