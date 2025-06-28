import "./globals.css";
import "@com.synergy/frontend-ui/frontendUiStyles.css";
import GoogleTag from "@com.synergy/frontend-ui/GoogleTag";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  ConsentManagerDialog,
  ConsentManagerProvider,
  CookieBanner,
  type ConsentManagerOptions,
  // @ts-ignore
} from "@c15t/react";
import YandexTag from "@com.synergy/frontend-ui/YandexTag";

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
  const options: ConsentManagerOptions = {
    mode: "c15t",
    backendURL: process.env.NEXT_PUBLIC_C15T_URL || "",
  };

  return (
    <ConsentManagerProvider options={options}>
      <ClerkProvider>
        <html lang={locale} className="scroll-smooth">
          <body className="relative">
            <YandexTag>{children}</YandexTag>
          </body>
          <CookieBanner
            title="Ihr Datenschutz ist uns wichtig"
            description="Diese Website verwendet Cookies, um Ihr Surferlebnis zu verbessern, den Website-Traffic zu analysieren und personalisierte Inhalte anzuzeigen."
            rejectButtonText="Ablehnen"
            customizeButtonText="Anpassen"
            acceptButtonText="Akzeptieren"
            theme={{
              "banner.footer": "bg-synergy-light-blue/10",
              "banner.footer.reject-button": "rounded-lg",
              "banner.footer.customize-button": "rounded-lg",
              "banner.footer.accept-button":
                "text-white rounded-lg !shadow-none bg-gradient-to-t from-synergy-light-blue via-synergy-light-blue/70 to-synergy-light-blue hover:from-synergy-light-blue hover:to-synergy-light-blue",
            }}
          />
          <ConsentManagerDialog />
          <GoogleTag />
        </html>
      </ClerkProvider>
    </ConsentManagerProvider>
  );
}
