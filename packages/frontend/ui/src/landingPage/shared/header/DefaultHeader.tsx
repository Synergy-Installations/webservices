import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { DefaultDropdown } from "@com.synergy/frontend-ui/DefaultDropdown";
import { MobileMenu } from "@com.synergy/frontend-ui/MobileMenu";
import Image from "next/image";
import Logo from "../../../shared/images/synergy-logo-grid.svg";

/* eslint-disable-next-line */
export interface DefaultHeaderProps {}

export const DefaultHeader = (props: DefaultHeaderProps) => {
  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 pl-3 pr-[6px] shadow-lg shadow-black/[0.03] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(theme(colors.gray.100),theme(colors.gray.200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            {/* <Logo /> */}
            <Link href="/" className="font-semibold pl-5">
              <Image
                src={Logo}
                width={undefined}
                height={undefined}
                alt="Logo"
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">
            {/* Desktop menu links */}
            <ul className="flex grow flex-wrap items-center justify-center gap-4 text-sm lg:gap-8">
              <li className="px-3 py-1">
                <Link
                  href="/products"
                  className="flex items-center text-synergy-dark-grey transition hover:text-gray-900"
                >
                  Produkte
                </Link>
              </li>
              <li className="px-3 py-1">
                <Link
                  href="#"
                  className="flex items-center text-synergy-dark-grey transition hover:text-gray-900"
                >
                  B2B
                </Link>
              </li>
              {/* 1st level: hover */}
              <DefaultDropdown title="Photovoltaik">
                {/* 2nd level: hover */}
                <li>
                  <Link
                    href="#"
                    className="flex rounded-lg px-2 py-1.5 text-sm text-synergy-dark-grey hover:bg-gray-100 w-max"
                  >
                    Erneuerbare Energieanlagen
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="flex rounded-lg px-2 py-1.5 text-sm text-synergy-dark-grey hover:bg-gray-100"
                  >
                    Energiekostenberatung
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="flex rounded-lg px-2 py-1.5 text-sm text-synergy-dark-grey hover:bg-gray-100"
                  >
                    Energiegemeinschaften
                  </Link>
                </li>
              </DefaultDropdown>
              <li className="px-3 py-1">
                <Link
                  href="#"
                  className="flex items-center text-synergy-dark-grey transition hover:text-gray-900"
                >
                  Über uns
                </Link>
              </li>
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
            <li>
              <Link
                href="/contact-us"
                className="btn !rounded-[10px] backdrop-blur-md bg-gradient-to-t from-synergy-light-blue/70 via-synergy-light-blue to-synergy-light-blue/70 hover:from-synergy-light-blue hover:to-synergy-light-blue text-white group"
              >
                <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5">
                Jetzt Anfragen
                <span className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                  {"->"}
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
