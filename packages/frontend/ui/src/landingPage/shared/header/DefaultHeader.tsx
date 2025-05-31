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
      Object.keys(messages.LandingPage.Shared.Header.nav[key].children) || []
    );
  };

  return (
    <header className="fixed z-50 w-full">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex justify-center xs:justify-end">
          <div className="grid xs:flex gap-1 justify-center w-full xs:w-max backdrop-blur-sm bg-white/70 px-2 py-[2px] rounded-lg">
            <a
              href={`mailto:office@synergiemontagen.eco?subject=Neue Anfrage&body=Guten Tag,%0D%0A%0D%0Ahiermit gebe ich meine Anforderungen und Wünsche bekannt:%0D%0A%0D%0ALeistungsgröße: %0D%0AVerbrauch: %0D%0ASpeicher: Ja/Nein %0D%0AInstallationsort: %0D%0ASonstige Wünsche: %0D%0A%0D%0AMeine Kontaktdaten sind: %0D%0AName: %0D%0ATelefonnummer: %0D%0A%0D%0AFG`}
              className="text-synergy-dark-grey hover:underline text-center hidden xs:block"
            >
              office@synergiemontagen.eco
            </a>
            <a
              href="tel:+436508696436"
              className="text-synergy-dark-grey hover:underline text-center"
            >
              +43 650 8696436
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
            <ul className="flex grow flex-wrap items-center justify-center gap-2 text-sm lg:gap-8">
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
                  <DefaultDropdown key={index} title={t(`nav.${navKey}.text`)}>
                    {/* 2nd level: hover */}
                    {getNavChildrenKeys(navKey).map((childKey, index) => (
                      <li key={index}>
                        <Link
                          href={t(`nav.${navKey}.children.${childKey}.href`)}
                          className="flex  rounded-lg px-2 py-1.5 text-sm text-synergy-dark-grey hover:bg-gray-100 w-full whitespace-nowrap"
                        >
                          {t(`nav.${navKey}.children.${childKey}.text`)}
                        </Link>
                      </li>
                    ))}
                  </DefaultDropdown>
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
