import "@com.synergy/frontend-ui/landingPageStyles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Provider } from "react-redux";
import { store } from "@com.synergy/frontend-backend-dashboard/store";
import { StoreProvider } from "@com.synergy/frontend-backend-dashboard/StoreProvider";
import { DefaultLayout } from "@com.synergy/frontend-ui/DashboardDefaultLayout";
import { createTheme, Flowbite } from "flowbite-react";

const inter = Inter({ subsets: ["latin"] });

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
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const customTheme = createTheme({
    theme: {
      tooltip: {
        target: "",
        animation: "transition-opacity",
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
        style: {
          dark: "bg-gray-900 text-white dark:bg-gray-700",
          light: "border border-gray-200 bg-white text-gray-900",
          auto: "border border-gray-200 bg-white text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
        },
        content: "relative z-20",
      },
    },
  });

  return (
    <NextIntlClientProvider messages={messages}>
      <StoreProvider>
        <Flowbite theme={customTheme}>
          <DefaultLayout>{children}</DefaultLayout>
        </Flowbite>
      </StoreProvider>
    </NextIntlClientProvider>
  );
}
