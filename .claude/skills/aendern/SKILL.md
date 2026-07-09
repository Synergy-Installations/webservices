---
name: aendern
description: Startet eine neue Änderung an der Website — legt einen sicheren Arbeits-Branch an, startet den lokalen Testserver und setzt die gewünschte Änderung um. Verwenden, wenn Michael etwas an der Website ändern möchte.
---

Michael möchte etwas an der Website ändern. Gewünschte Änderung: $ARGUMENTS
(Falls leer: frag auf Deutsch nach, was geändert werden soll.)

Gehe nach dem Standard-Workflow aus CLAUDE.md vor:

1. Prüfe mit `git status` und `git branch --show-current`, wo du stehst.
   - Neues Thema → von einem aktuellen `main` einen neuen Branch
     `michael/<kurzer-name>` erstellen (erst `git switch main && git pull --ff-only origin main`).
   - Passt die Änderung zum bestehenden Arbeits-Branch (Folgeänderung) → dort weiterarbeiten.
2. Prüfe mit `lsof -ti:3000`, ob der Testserver läuft. Wenn nicht: `pnpm dev` im
   Hintergrund starten und warten, bis er bereit ist.
3. Setze die Änderung um (Texte immer in `at-AT.json` UND `en.json`).
4. Führe `pnpm lint` und `pnpm type-check` aus und behebe Fehler.
5. Öffne die betroffene Seite: `open http://localhost:3000/at-AT/...`
6. Erkläre Michael auf Deutsch in einfachen Worten, was du geändert hast, und bitte
   ihn, die Seite im Browser anzuschauen. Erkläre: das ist nur die Test-Version auf
   seinem Computer — die echte Website ist noch unverändert. Wenn es passt, kann er
   `/vorschau` (Online-Vorschau) sagen oder `/live` (zur Veröffentlichung an Elias
   schicken, der es prüft und freischaltet).

Beachte die Tabu-Zonen aus CLAUDE.md: Wenn die Anfrage Datenbank, Dashboard-Logik,
Login, E-Mail-Versand oder Ähnliches betrifft, nicht umsetzen, sondern freundlich
erklären, dass das Elias machen muss.
