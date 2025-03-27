import "./globals.css";
import "@com.synergy/frontend-ui/frontendUiStyles.css";
import GoogleTag from "@com.synergy/frontend-ui/GoogleTag";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

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
  return (
    <html lang={locale} className="scroll-smooth">
      <ClerkProvider>
        <body className="relative">{children}</body>
      </ClerkProvider>
      <GoogleTag />
    </html>
  );
}
