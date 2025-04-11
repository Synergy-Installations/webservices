import "@com.synergy/frontend-ui/landingPageStyles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Provider } from "react-redux";
import { store } from "@com.synergy/frontend-backend-dashboard/store";
import { StoreProvider } from "@com.synergy/frontend-backend-dashboard/StoreProvider";
import { DefaultLayout } from "@com.synergy/frontend-ui/DashboardDefaultLayout";

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

  return (
    <NextIntlClientProvider messages={messages}>
      <StoreProvider>
        <DefaultLayout>{children}</DefaultLayout>
      </StoreProvider>
    </NextIntlClientProvider>
  );
}
