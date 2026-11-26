/**
 * llms.txt – kurze Firmenbeschreibung für KI-Suchen (ChatGPT, Claude,
 * Perplexity …). Erreichbar unter https://synergie.cc/llms.txt
 * (wird automatisch auf /at-AT/llms.txt weitergeleitet).
 */
const TEXT = `# SYNERGIE Montagen Riegler GmbH

> Montagepartner für Photovoltaik-Projekte mit Sitz in Bad Vöslau (Niederösterreich, Österreich). SYNERGIE übernimmt Beratung & Engineering, Umsetzung und Anlagenservice für Photovoltaik-Anlagen – für Fachbetriebe und Projektentwickler in Österreich, Europa und Afrika. Ein fixer Ansprechpartner mit Handschlagqualität.

## Leistungen

- Beratung & Engineering: Machbarkeitsstudien, technische Unterstützung, Konzeptdesign, Behördenverfahren, Planung
- Umsetzung: Projektmanagement, örtliche Bauaufsicht, Bauausführung (Montage von Dachanlagen, PV-Fassaden, PV-Überdachungen und Freiflächenanlagen), Materialbeschaffung, Generalunternehmer
- Anlagenservice: Wartung, Fehlerbehebung, Reinigung

## Für wen

Haustechniker, Elektriker und Installateure; EPC-Unternehmen; Anlagenbetreiber; beratende und planende Betriebe; Hausverwaltungen, Immobilienentwickler und Architekten.

## Einsatzgebiet

Österreich, Europa und Afrika (z. B. Sambia).

## Kontakt

- Firma: SYNERGIE Montagen Riegler GmbH, Anton Krenn Straße 23/2, 2540 Bad Vöslau, Österreich
- Geschäftsführer: Michael Riegler
- Telefon: +43 664 244 87 42
- E-Mail: office@synergie.cc
- Rückmeldung auf Anfragen innerhalb von 24 Stunden
- Mitglied bei PV Austria, OVE und WKO

## Seiten

- [Startseite](https://synergie.cc/at-AT): Überblick, Ablauf in drei Schritten, Vorteile, häufige Fragen
- [Leistungen](https://synergie.cc/at-AT/leistungen): alle Leistungen im Detail, Projektfotos, Partner
- [PV Montage buchen](https://synergie.cc/at-AT/contact-us-funnel): Projektunterlagen hochladen und Angebot anfragen
- [Über uns](https://synergie.cc/at-AT/about-us): Firma und Geschäftsführer
- [Kontakt](https://synergie.cc/at-AT/kontakt)
- [English version](https://synergie.cc/en): Photovoltaic project delivery & PV installation for contractors
`;

export const dynamic = "force-static";

export function GET() {
  return new Response(TEXT, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
