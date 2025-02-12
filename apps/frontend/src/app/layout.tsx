import "./globals.css";
import "@com.synergy/frontend-ui/frontendUiStyles.css";
import type { Metadata } from "next";

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
      <body className="relative">{children}</body>
    </html>
  );
}
