"use client";

import { DefaultHeader } from '@com.synergy/frontend-ui/DefaultHeader';
import { Inter } from "next/font/google";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const inter = Inter({ subsets: ["latin"] });

/* eslint-disable-next-line */
export interface DefaultLayoutProps {
  children: React.ReactNode;
}

export const DefaultLayout = (props: DefaultLayoutProps) => {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
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
        </div>
      </div>
  );
};

export default DefaultLayout;