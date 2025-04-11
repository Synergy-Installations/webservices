"use client";

import { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import { useMessages, useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface MobileMenuProps {}

export const MobileMenu = (props: MobileMenuProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const trigger = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLDivElement>(null);

  const t = useTranslations("LandingPage.Shared.Header");

  const messages: any = useMessages();
  const NavKeys = Object.keys(messages.LandingPage.Shared.Header.nav);

  const getNavChildrenKeys = (key: string): string[] => {
    return (
      Object.keys(messages.LandingPage.Shared.Header.nav[key].children) || []
    );
  };

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!mobileNav.current || !trigger.current) return;
      if (
        !mobileNavOpen ||
        mobileNav.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setMobileNavOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className="flex md:hidden">
      {/* Hamburger button */}
      <button
        ref={trigger}
        className={`group inline-flex h-8 w-8 items-center justify-center bg-transparent text-center text-gray-800 transition ${mobileNavOpen && "active"}`}
        aria-controls="mobile-nav"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <span className="sr-only">Menu</span>
        <svg
          className="pointer-events-none fill-current"
          width={16}
          height={16}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] -translate-y-[5px] translate-x-[7px] group-[[aria-expanded=true]]:rotate-[315deg] group-[[aria-expanded=true]]:translate-y-0 group-[[aria-expanded=true]]:translate-x-0"
            y="7"
            x={mobileNavOpen ? "-0" : "-7"}
            width="16"
            height="2"
            rx="1"
          ></rect>
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-[[aria-expanded=true]]:rotate-45"
            y="7"
            width="16"
            height="2"
            rx="1"
          ></rect>
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] translate-y-[5px] group-[[aria-expanded=true]]:rotate-[135deg] group-[[aria-expanded=true]]:translate-y-0"
            y="7"
            width="9"
            height="2"
            rx="1"
          ></rect>
        </svg>
      </button>

      {/*Mobile navigation */}
      <div ref={mobileNav}>
        <Transition
          show={mobileNavOpen}
          as="nav"
          id="mobile-nav"
          className="absolute left-0 top-full z-20 w-full rounded-xl bg-white shadow-lg shadow-black/[0.03] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(theme(colors.gray.100),theme(colors.gray.200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]"
          enter="transition ease-out duration-200 transform"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ul className="p-2 text-sm">
            {NavKeys.map((navKey, index) => (
              <div key={index}>
                <li>
                  {t(`nav.${navKey}.href`) === "" ? (
                    <div className="flex rounded-lg px-2 py-1.5 text-gray-700 font-medium">
                      {t(`nav.${navKey}.text`)}
                    </div>
                  ) : (
                    <Link
                      href={t(`nav.${navKey}.href`)}
                      className="flex rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      {t(`nav.${navKey}.text`)}
                    </Link>
                  )}
                </li>
                {getNavChildrenKeys(navKey).map((childKey, index) => (
                  <li key={index}>
                    <Link
                      href={t(`nav.${navKey}.children.${childKey}.href`)}
                      className="flex rounded-lg ml-2 px-2 py-1.5 text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      {t(`nav.${navKey}.children.${childKey}.text`)}
                    </Link>
                  </li>
                ))}
              </div>
            ))}

            <li className="flex items-center justify-center mt-4 gap-2">
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
        </Transition>
      </div>
    </div>
  );
};

export default MobileMenu;
