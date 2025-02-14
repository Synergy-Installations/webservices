import { useMessages, useTranslations } from "next-intl";
import Image from "next/image";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import { RichText } from "@com.synergy/frontend-ui/RichText";

/* eslint-disable-next-line */
export interface ContactCommunityProps {}

export const ContactCommunity = (props: ContactCommunityProps) => {
  const t = useTranslations("LandingPage.ContactUs.CommunityBlocks");

  const messages: any = useMessages();

  const communityBlockKeys = Object.keys(
    messages.LandingPage.ContactUs.CommunityBlocks.blocks
  );

  return (
    <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-slate-50 before:-z-10">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-inter-tight text-3xl font-bold text-slate-900">
              Join the Community
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-8">
            {/* Item #1 */}
            {communityBlockKeys.map((communityBlockKey, index) => (
              <div
                key={index}
                className="flex flex-col p-4 border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.slate.300),theme(colors.slate.100),theme(colors.slate.300))_border-box] rounded-lg shadow shadow-black/5"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mr-3">
                    <Image
                      className="shrink-0 fill-synergy-light-blue opacity-100 group-hover:opacity-100 transform duration-500 ease-in-out"
                      loader={ImageLoader}
                      width={Number(
                        t(`blocks.${communityBlockKey}.icon.width`)
                      )}
                      height={Number(
                        t(`blocks.${communityBlockKey}.icon.height`)
                      )}
                      src={t(`blocks.${communityBlockKey}.icon.src`)}
                      alt={t(`blocks.${communityBlockKey}.icon.alt`)}
                    />
                    {/* <svg
                      className="fill-slate-100"
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="16"
                    >
                      <path d="M18.624 1.326A18.784 18.784 0 0 0 14.146.001a.07.07 0 0 0-.072.033c-.193.328-.408.756-.558 1.092a17.544 17.544 0 0 0-5.03 0A10.86 10.86 0 0 0 7.922.034.072.072 0 0 0 7.849 0C6.277.26 4.774.711 3.37 1.326a.063.063 0 0 0-.03.024C.49 5.416-.292 9.382.091 13.298c.002.02.013.038.029.05a18.598 18.598 0 0 0 5.493 2.65.073.073 0 0 0 .077-.025c.423-.551.8-1.133 1.124-1.744.02-.036 0-.079-.038-.093a12.278 12.278 0 0 1-1.716-.78.066.066 0 0 1-.007-.112c.115-.082.23-.168.34-.255a.07.07 0 0 1 .072-.009c3.6 1.569 7.498 1.569 11.056 0a.07.07 0 0 1 .072.008c.11.087.226.174.342.256a.066.066 0 0 1-.006.112c-.548.305-1.118.564-1.717.78a.066.066 0 0 0-.038.093c.33.61.708 1.192 1.123 1.743a.072.072 0 0 0 .078.025 18.538 18.538 0 0 0 5.502-2.65.067.067 0 0 0 .028-.048c.459-4.528-.768-8.461-3.252-11.948a.055.055 0 0 0-.03-.025ZM7.352 10.914c-1.084 0-1.977-.95-1.977-2.116 0-1.166.875-2.116 1.977-2.116 1.11 0 1.994.958 1.977 2.116 0 1.166-.876 2.116-1.977 2.116Zm7.31 0c-1.084 0-1.977-.95-1.977-2.116 0-1.166.876-2.116 1.977-2.116 1.11 0 1.994.958 1.977 2.116 0 1.166-.867 2.116-1.977 2.116Z" />
                    </svg> */}
                  </div>
                  <h3 className="font-inter-tight font-semibold text-slate-800">
                    {t(`blocks.${communityBlockKey}.title`)}
                  </h3>
                </div>
                <div className="grow text-sm text-slate-500">
                  <RichText>
                    {(tags) =>
                      t.rich(`blocks.${communityBlockKey}.description`, tags)
                    }
                  </RichText>
                </div>
                <div className="text-right">
                  <a
                    className="inline-flex items-center font-medium text-sm mt-4"
                    href={t(`blocks.${communityBlockKey}.link.href`)}
                    target="_blank"
                  >
                    {t(`blocks.${communityBlockKey}.link.text`)}
                    <svg
                      className="shrink-0 ml-1 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      width="9"
                      height="9"
                    >
                      <path d="m1.285 8.514-.909-.915 5.513-5.523H1.663l.01-1.258h6.389v6.394H6.794l.01-4.226z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCommunity;
