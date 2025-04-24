import "./globals.css";
import "@com.synergy/frontend-ui/frontendUiStyles.css";
import GoogleTag from "@com.synergy/frontend-ui/GoogleTag";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { createTheme } from "flowbite-react";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const customTheme = createTheme({
    arrow: {
      base: "absolute z-10 h-2 w-2 rotate-45",
      style: {
        dark: "bg-gray-900 dark:bg-gray-700",
        light: "bg-white",
        auto: "bg-white dark:bg-gray-700",
      },
      placement: "-4px",
    },
    base: "absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium shadow-sm",
    hidden: "invisible opacity-0",
  });
  return (
    <ClerkProvider>
      <html lang={locale} className="scroll-smooth">
        <body className="relative">{children}</body>
        <GoogleTag />
      </html>
    </ClerkProvider>
  );
}
