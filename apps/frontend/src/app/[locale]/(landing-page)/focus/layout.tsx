import { redirect } from "next/navigation";

/**
 * Produktseiten sind vorübergehend deaktiviert (Fokus auf B2B-Dienstleistungen
 * für PV). Alle Aufrufe werden auf die Leistungen-Seite umgeleitet.
 * Zum Reaktivieren einfach diese Datei löschen – die Seiten selbst sind
 * unverändert vorhanden.
 */
export default function ProductsDisabledLayout({
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  redirect(`/${locale}/leistungen`);
}
