"use client";

import { DefaultHeader } from "@com.synergy/frontend-ui/DefaultHeader";
import { Nunito_Sans } from "next/font/google";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import DefaultFooter from "@com.synergy/frontend-ui/DefaultFooter";
import { useMessages, useTranslations } from "next-intl";
import WhatsappButton from "../whatsapp/WhatsappButton";
import PageTransitionHero from "../heroes/PageTransitionHero";
import SunConfigurator from "./SunConfigurator";
import Head from "next/head";

// Ersatz für die Markenschrift Avenir (Avenir selbst ist lizenzpflichtig)
const brandFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
});

/* eslint-disable-next-line */
export interface DefaultLayoutProps {
  children: React.ReactNode;
}

export const DefaultLayout = (props: DefaultLayoutProps) => {
  useEffect(() => {
    AOS.init({
      once: true,
      // disable: "mobile",
      duration: 700,
      easing: "ease-out-cubic",
    });
  });

  return (
    <div
      className={`${brandFont.variable} bg-gray-50 font-brand text-synergy-dark-grey antialiased`}
    >
      <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
        <SunConfigurator />
        <DefaultHeader />
        {/* WhatsApp-Chat, bewusst ohne Benachrichtigungston */}
        <WhatsappButton />
        {/* Kurzer Helden-Zoom beim Öffnen der Website */}
        <PageTransitionHero />
        <main className="grow">{props.children}</main>
        <DefaultFooter border={true} />
      </div>
    </div>
  );
};

export default DefaultLayout;
