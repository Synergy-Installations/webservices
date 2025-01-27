"use client";

import { DefaultHeader } from "@com.synergy/frontend-ui/DefaultHeader";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import DefaultFooter from "@com.synergy/frontend-ui/DefaultFooter";
import { useMessages, useTranslations } from "next-intl";

const inter = Inter({ subsets: ["latin"] });

/* eslint-disable-next-line */
export interface DefaultLayoutProps {
  children: React.ReactNode;
}

export const DefaultLayout = (props: DefaultLayoutProps) => {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: false,
      duration: 700,
      easing: "ease-out-cubic",
    });
  });

  return (
    <div
      className={`${inter.className} bg-gray-50 font-inter tracking-tight text-gray-900 antialiased`}
    >
      <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
        <DefaultHeader />
        <main className="grow">{props.children}</main>
        <DefaultFooter border={true} />
      </div>
    </div>
  );
};

export default DefaultLayout;
