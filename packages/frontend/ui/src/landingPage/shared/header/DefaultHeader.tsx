import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { DefaultDropdown } from "@com.synergy/frontend-ui/DefaultDropdown";
import { MobileMenu } from "@com.synergy/frontend-ui/MobileMenu";
import Image from "next/image";
// import Logo from "../../../shared/images/synergy-logo-grid.svg";
import { useMessages, useTranslations } from "next-intl";
import ImageLoader from "@com.synergy/frontend-ui/ImageLoader";

/* eslint-disable-next-line */
export interface DefaultHeaderProps {}

export const DefaultHeader = (props: DefaultHeaderProps) => {
  const t = useTranslations("LandingPage.Shared.Header");

  const messages: any = useMessages();
  const NavKeys = Object.keys(messages.LandingPage.Shared.Header.nav);
  const socialKeys = Object.keys(messages.LandingPage.Shared.Header);

  const getNavChildrenKeys = (key: string): string[] => {
    return (
      Object.keys(messages.LandingPage.Shared.Header.nav[key].children.list) ||
      []
    );
  };

  return (
    <header className="fixed top-2 xs:top-1 z-50 w-full">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="hidden xs:flex justify-center xs:justify-end xs:mb-1">
          <div className="grid xs:flex gap-8 justify-center w-full xs:w-max backdrop-blur-sm bg-white/70 px-2 py-[2px] rounded-lg">
            <a
              href={`mailto:office@synergie.cc?subject=Neue Anfrage&body=Guten Tag,%0D%0A%0D%0Ahiermit gebe ich meine Anforderungen und Wünsche bekannt:%0D%0A%0D%0ALeistungsgröße: %0D%0AVerbrauch: %0D%0ASpeicher: Ja/Nein %0D%0AInstallationsort: %0D%0ASonstige Wünsche: %0D%0A%0D%0AMeine Kontaktdaten sind: %0D%0AName: %0D%0ATelefonnummer: %0D%0A%0D%0AFG`}
              className="text-synergy-dark-grey hover:underline text-center hidden xs:block"
            >
              office@synergie.cc
            </a>
            <a
              href="tel:+436642448742"
              className="text-synergy-dark-grey hover:underline text-center hidden xs:block"
            >
              +43 664 244 87 42
            </a>
          </div>
        </div>
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 pl-3 pr-[6px] shadow-lg shadow-black/[0.03] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(theme(colors.gray.100),theme(colors.gray.200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          {/* Site branding */}
          <div className="flex flex-1 items-center flex-grow">
            {/* <Logo /> */}
            <Link
              href={t("logo.href")}
              className="font-semibold pl-5 cursor-pointer w-max"
            >
              <Image
                loader={ImageLoader}
                src={t("logo.src")}
                width={Number(t("logo.width"))}
                height={Number(t("logo.height"))}
                alt="Logo"
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow !mb-0">
            {/* Desktop menu links */}
            <ul className="flex grow flex-wrap items-center justify-center gap-2 text-base lg:gap-8">
              {NavKeys.map((navKey, index) =>
                t(`nav.${navKey}.children`) === "" ? (
                  <li className="px-3 py-1" key={index}>
                    <Link
                      href={t(`nav.${navKey}.href`)}
                      className="flex items-center text-synergy-dark-grey transition hover:text-gray-900"
                    >
                      {t(`nav.${navKey}.text`)}
                    </Link>
                  </li>
                ) : (
                  /* 1st level: hover */
                  <>
                    {(() => {
                      const childrenKeys = getNavChildrenKeys(navKey);
                      const hasImages = childrenKeys.some(
                        (childKey) =>
                          messages.LandingPage.Shared.Header.nav[navKey]
                            .children.list[childKey].imageSrc !== undefined
                      );
                      const ulClass = hasImages
                        ? "grid grid-cols-1 md:grid-cols-3 gap-4"
                        : "flex flex-col gap-2";
                      return (
                        <DefaultDropdown
                          key={index}
                          title={t(`nav.${navKey}.text`)}
                          className={`absolute left-1/2 -translate-x-1/2 top-8 mt-2 w-screen ${hasImages ? "max-w-md md:max-w-lg lg:max-w-lg" : "max-w-min"} bg-white rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5`}
                        >
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 whitespace-nowrap">
                              {t(`nav.${navKey}.children.title`)}
                            </h3>
                            <ul className={ulClass}>
                              {childrenKeys.map((childKey, idx) => {
                                const child =
                                  messages.LandingPage.Shared.Header.nav[navKey]
                                    .children.list[childKey];
                                return child.imageSrc !== undefined ? (
                                  <li
                                    key={t(
                                      `nav.${navKey}.children.list.${childKey}.title`
                                    )}
                                  >
                                    <Link
                                      href={t(
                                        `nav.${navKey}.children.list.${childKey}.href`
                                      )}
                                      className="flex flex-col items-center p-3 hover:bg-green-50 rounded-lg transition"
                                    >
                                      <div className="relative w-16 h-16 mb-2">
                                        <Image
                                          loader={ImageLoader}
                                          src={t(
                                            `nav.${navKey}.children.list.${childKey}.imageSrc`
                                          )}
                                          alt={t(
                                            `nav.${navKey}.children.list.${childKey}.alt`
                                          )}
                                          width={64}
                                          height={64}
                                          className="rounded-lg w-16 h-16 object-cover"
                                        />
                                      </div>
                                      <span className="text-gray-800 font-medium text-sm text-center w-min break-words">
                                        {t(
                                          `nav.${navKey}.children.list.${childKey}.title`
                                        )}
                                      </span>
                                    </Link>
                                  </li>
                                ) : (
                                  <li
                                    key={t(
                                      `nav.${navKey}.children.list.${childKey}.title`
                                    )}
                                  >
                                    <Link
                                      href={t(
                                        `nav.${navKey}.children.list.${childKey}.href`
                                      )}
                                      className="flex rounded-lg px-2 py-1.5 text-sm text-synergy-dark-grey hover:bg-gray-100 whitespace-nowrap"
                                    >
                                      {t(
                                        `nav.${navKey}.children.list.${childKey}.title`
                                      )}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </DefaultDropdown>
                      );
                    })()}
                  </>
                )
              )}
            </ul>
          </nav>

          {/* Desktop sign in links */}
          <ul className="flex flex-1 items-center justify-end gap-3">
            {/* <li>
              <Link
                href="#"
                className="btn-sm bg-white text-gray-800 shadow hover:bg-gray-50"
              >
                Video tour
              </Link>
            </li> */}

            <li className="hidden sm:block">
              <Link
                href={t("button.href")}
                className="btn !rounded-[10px] backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue text-white group"
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                  {t("button.text")}
                  <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    {"->"}
                  </span>
                </span>
              </Link>
            </li>
            <li className="hidden sm:block md:hidden lg:block">
              <Link
                href={"/dashboard"}
                className="btn !rounded-[10px] backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue text-white group"
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                  Member Login
                  <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    {/* {"->"} */}
                  </span>
                </span>
              </Link>
            </li>
          </ul>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default DefaultHeader;
