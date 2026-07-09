---
name: vorschau
description: Lädt den aktuellen Arbeits-Branch zu GitHub hoch, damit Vercel eine Online-Vorschau baut (die echte Website bleibt unverändert). Verwenden, wenn Michael eine Vorschau möchte oder die Änderung online prüfen will.
---

Michael möchte eine Online-Vorschau der aktuellen Änderungen.

1. Sicherstellen, dass du auf einem Arbeits-Branch bist (nicht `main`). Wenn du auf
   `main` bist und es keine offenen Änderungen gibt, erkläre, dass es gerade nichts
   Neues zum Anschauen gibt.
2. `pnpm lint` und `pnpm type-check` ausführen; Fehler beheben (sonst schlägt der
   Vercel-Build fehl).
3. Alle offenen Änderungen committen (kurze, beschreibende Commit-Message).
4. `git push -u origin <branch>` ausführen.
5. Die Vorschau-Adresse lautet:
   `https://webservices-frontend-git-<branch-slug>-synergy-installations.vercel.app`
   — `<branch-slug>` ist der Branch-Name in Kleinbuchstaben, alle Sonderzeichen
   (auch `/`) durch `-` ersetzt. Beispiel: `michael/telefon-footer` →
   `https://webservices-frontend-git-michael-telefon-footer-synergy-installations.vercel.app`
6. Gib Michael diese Adresse und erkläre auf Deutsch: Vercel baut die Vorschau in
   ca. 2–3 Minuten. Die echte Website synergie.cc ist davon NICHT betroffen. Den
   Link kann er auch anderen zum Anschauen schicken.
7. Zum Schluss erwähnen: Wenn alles passt, kann er mit `/live` die Änderung zur
   Veröffentlichung einreichen — Elias prüft sie dann und schaltet sie frei.
