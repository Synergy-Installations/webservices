import { useMessages, useTranslations } from "next-intl";
import RichText from "../../../shared/internationalization/text/RichText";

/* eslint-disable-next-line */
export interface ServiceWrapperProps {}

const cleanTitle = (title: string) => title.replace(/-\s*\n\s*/g, "");

/**
 * Ein aufklappbarer Eintrag für eine einzelne Leistung (z. B. „Planung“).
 * Standardmäßig ist nur der Titel sichtbar, alle Details erscheinen per Klick.
 */
const SubServiceDetails = ({
  service,
  subService,
  data,
  tone,
}: {
  service: string;
  subService: string;
  data: any;
  tone: "light" | "dark";
}) => {
  const t = useTranslations(
    `LandingPage.B2B.Services.${service}.SubServices.${subService}`,
  );
  const tc = useTranslations("LandingPage.B2B.Competencies");
  const boxes = Object.keys(data?.Components?.boxes || {});
  const benefits = Object.keys(data?.Background?.boxes?.boxLeft?.list || {});
  const steps = Object.keys(data?.Background?.boxes?.boxRight?.list || {});
  const dark = tone === "dark";

  return (
    <details
      id={`${service}-${subService}`}
      className={`group rounded-xl border transition ${
        dark
          ? "border-white/20 bg-white/10 open:bg-white/15"
          : "border-gray-200 bg-white open:shadow-lg"
      }`}
    >
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden ${
          dark ? "text-white" : "text-gray-900"
        }`}
      >
        <span>{cleanTitle(String(data?.Diamond?.title || subService))}</span>
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none transition-transform group-open:rotate-45 ${
            dark
              ? "bg-white/20 text-white"
              : "bg-synergy-light-blue/15 text-synergy-light-blue"
          }`}
        >
          +
        </span>
      </summary>
      <div
        className={`space-y-5 px-5 pb-6 ${dark ? "text-white/90" : "text-synergy-dark-grey"}`}
      >
        <h3
          className={`text-xl font-bold ${dark ? "text-white" : "text-gray-900"}`}
        >
          {t("Components.titleOne")}
        </h3>
        <div>
          <RichText>
            {(tags) => t.rich("Components.descriptionOne", tags)}
          </RichText>
        </div>
        {data?.Components?.descriptionTwo ? (
          <div>
            <RichText>
              {(tags) => t.rich("Components.descriptionTwo", tags)}
            </RichText>
          </div>
        ) : null}
        {boxes.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-3">
            {boxes.map((box) => (
              <li
                key={box}
                className={`rounded-lg p-4 ${dark ? "bg-white/10" : "bg-synergy-light-grey/60"}`}
              >
                <div
                  className={`font-semibold mb-1 ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {t(`Components.boxes.${box}.title`)}
                </div>
                <div className="text-sm">
                  {t(`Components.boxes.${box}.description`)}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {benefits.length > 0 || steps.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.length > 0 ? (
              <div>
                <div
                  className={`font-semibold mb-2 ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {t("Background.boxes.boxLeft.title") || tc("benefitsTitle")}
                </div>
                <ul className="space-y-1">
                  {benefits.map((key) => (
                    <li key={key} className="flex gap-2">
                      <span
                        className={
                          dark ? "text-white" : "text-synergy-light-blue"
                        }
                      >
                        ✓
                      </span>
                      <span>
                        <RichText>
                          {(tags) =>
                            t.rich(`Background.boxes.boxLeft.list.${key}`, tags)
                          }
                        </RichText>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {steps.length > 0 ? (
              <div>
                <div
                  className={`font-semibold mb-2 ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {t("Background.boxes.boxRight.title")}
                </div>
                <ol className="space-y-1">
                  {steps.map((key, idx) => (
                    <li key={key} className="flex gap-2">
                      <span className="font-semibold">{idx + 1}.</span>
                      <span>
                        <RichText>
                          {(tags) =>
                            t.rich(
                              `Background.boxes.boxRight.list.${key}`,
                              tags,
                            )
                          }
                        </RichText>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </details>
  );
};

/**
 * Alle Leistungsbereiche. Jeder Bereich bekommt ein anderes Layout,
 * damit die Seite nicht eintönig wirkt:
 *  0 – helle Fläche, Titel links, Liste rechts
 *  1 – graue Fläche, Bild links, Liste rechts
 *  2 – blaue Fläche, Liste zweispaltig
 */
export const ServiceWrapper = (props: ServiceWrapperProps) => {
  const messages: any = useMessages();
  const services: Record<string, any> = messages.LandingPage.B2B.Services;

  return (
    <div className="space-y-6 md:space-y-10">
      {Object.keys(services).map((service, index) => {
        const subServices: Record<string, any> =
          services[service].SubServices || {};
        const subKeys = Object.keys(subServices);
        const variant = index % 3;
        const number = String(index + 1).padStart(2, "0");
        const firstImage = subServices[subKeys[0]]?.Diamond?.backgroundImage;
        const list = (tone: "light" | "dark", cols = false) => (
          <div
            className={`grid gap-3 ${cols ? "md:grid-cols-2 items-start" : ""}`}
          >
            {subKeys.map((sub) => (
              <SubServiceDetails
                key={sub}
                service={service}
                subService={sub}
                data={subServices[sub]}
                tone={tone}
              />
            ))}
          </div>
        );

        if (variant === 0) {
          return (
            <section key={service} id={service} className="scroll-mt-24 px-4">
              <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1fr_2fr] py-8">
                <div>
                  <p className="text-synergy-light-blue font-semibold uppercase mb-2">
                    {number}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {services[service].title}
                  </h2>
                  <div className="w-16 h-1 bg-synergy-light-blue mt-4" />
                </div>
                {list("light")}
              </div>
            </section>
          );
        }

        if (variant === 1) {
          return (
            <section
              key={service}
              id={service}
              className="scroll-mt-24 bg-synergy-light-grey rounded-[40px] md:rounded-[80px] mx-2 md:mx-6 px-4 py-12"
            >
              <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2 items-start">
                <div className="lg:sticky lg:top-28 lg:text-right">
                  <p className="text-synergy-light-blue font-semibold uppercase mb-2">
                    {number}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {services[service].title}
                  </h2>
                  <div className="w-16 h-1 bg-synergy-light-blue mt-4 mb-6 lg:ml-auto" />
                  {firstImage?.src ? (
                    <div className="relative h-56 md:h-72 overflow-hidden rounded-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={firstImage.src}
                        alt={firstImage.alt || ""}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                {list("light")}
              </div>
            </section>
          );
        }

        return (
          <section
            key={service}
            id={service}
            className="scroll-mt-24 mx-2 md:mx-6 rounded-[40px] bg-gradient-to-br from-synergy-light-blue to-synergy-dark-grey px-4 py-12 text-white"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col items-center text-center mb-8">
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/70 text-lg font-bold">
                  {number}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {services[service].title}
                </h2>
                <div className="w-16 h-1 bg-white mt-4" />
              </div>
              {list("dark", true)}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ServiceWrapper;
