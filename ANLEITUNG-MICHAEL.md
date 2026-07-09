# Anleitung: Website ändern mit Claude Code

Diese Anleitung ist für Michael. Du brauchst nur **zwei Programme**: die
**Claude-App** und deinen **Browser** (Safari/Chrome). VS Code ist installiert,
aber du musst es nie öffnen — Claude erledigt alles Technische für dich.

## So startest du

1. Öffne die **Claude-App** und wähle dort **Claude Code** mit dem Projekt
   „webservices" (der Website-Ordner).
2. Schreib einfach auf Deutsch, was du möchtest. Ganz normal, wie du es Elias
   sagen würdest, z.B.:
   - „Ändere die Telefonnummer im Footer auf 0664 1234567"
   - „Der Text auf der Über-uns-Seite soll freundlicher klingen"
   - „Tausche das Bild auf der Startseite aus"

## Die drei Stufen jeder Änderung

Jede Änderung durchläuft drei Stufen — **nichts geht aus Versehen online**:

| Stufe | Was es ist | Wer es sieht |
|---|---|---|
| 1. Test auf deinem Computer | Claude zeigt dir die Änderung unter `http://localhost:3000` | Nur du |
| 2. Online-Vorschau | Eine Probe-Version im Internet mit eigener Adresse | Nur wer den Link hat |
| 3. Einreichen → Live | Du schickst die Änderung ab, **Elias prüft sie und schaltet sie frei** auf **synergie.cc** | Alle (nach Freigabe) |

Weder Claude noch du können die echte Website direkt verändern — jede
Veröffentlichung läuft über Elias. Es kann also nichts schiefgehen.

## Nützliche Befehle (einfach eintippen)

- `/aendern` + dein Wunsch → startet eine neue Änderung sicher
- `/vorschau` → stellt eine Online-Probe-Version bereit
- `/live` → schickt die geprüfte Änderung zur Freigabe an Elias
- `/stand` → erklärt dir, wo du gerade stehst

Du musst diese Befehle nicht verwenden — normales Schreiben funktioniert genauso.
Sie sind nur Abkürzungen.

## Wichtige Regeln

- **Ein Wunsch nach dem anderen.** Erst anschauen, dann der nächste.
- **Schau dir jede Änderung an** (am besten in der Online-Vorschau), bevor du
  sie mit „live" an Elias schickst.
- Ändere **keine Dateien selbst** (nicht in VS Code oder im Finder) — sag es
  immer Claude, sonst kommt ihr durcheinander.
- Wenn Claude sagt, dass etwas „Elias braucht" (Datenbank, Login, E-Mails,
  Kalender-Logik), dann bitte wirklich Elias fragen.

## Wenn etwas nicht klappt

1. Sag Claude: „Das hat nicht funktioniert, was ist das Problem?" — oft löst
   Claude es selbst.
2. Hilft das nicht: Claude-App schließen, neu öffnen, `/stand` eintippen.
3. Im Zweifel: **Elias kontaktieren** (eliascerne@icloud.com). Es kann nichts
   endgültig kaputtgehen — die echte Website ändert sich erst, wenn Elias eine
   eingereichte Änderung geprüft und freigeschaltet hat.
