---
name: live
description: Reicht die geprüften Änderungen des aktuellen Arbeits-Branches zur Veröffentlichung ein — Elias prüft den Pull Request und schaltet ihn auf synergie.cc frei. Verwenden, wenn Michael die Änderung live haben möchte.
---

Michael möchte die aktuellen Änderungen auf synergie.cc veröffentlichen.

Wichtig: Live schalten kann nur Elias. Dein Job ist, die Änderung sauber
**einzureichen** (Pull Request). Du mergst NIEMALS selbst nach `main` und
verwendest NIEMALS `gh pr merge`.

1. Prüfe: Bist du auf einem Arbeits-Branch (nicht `main`)? Gibt es Änderungen
   gegenüber `main` (`git log origin/main..HEAD --oneline` nach `git fetch origin`)?
   Wenn nicht, erkläre freundlich, dass es nichts einzureichen gibt.
2. Offene, ungespeicherte Änderungen zuerst committen. Falls noch nicht geschehen,
   `pnpm lint` und `pnpm type-check` laufen lassen und Fehler beheben.
3. Stelle GENAU EINE Rückfrage auf Deutsch:
   „Soll ich das jetzt zur Veröffentlichung an Elias schicken?"
   Nur bei klarem Ja weitermachen.
4. Führe `pnpm submit` aus (optional mit kurzem deutschen Titel als Argument:
   `pnpm submit "Neue Telefonnummer im Footer"`). Das Skript lädt den Branch hoch,
   erstellt den Pull Request und gibt die Vorschau-Adresse aus.
5. Erkläre Michael auf Deutsch:
   - Die Änderung ist eingereicht — Elias bekommt sie zur Prüfung und schaltet
     sie frei. Sie ist noch NICHT auf der echten Website.
   - Gib ihm die Vorschau-Adresse aus der Skript-Ausgabe (dort sieht er den Stand,
     der live gehen wird).
   - Falls das Skript einen HINWEIS ausgibt, dass der Pull Request manuell erstellt
     werden muss: sag Michael, er soll Elias kurz Bescheid geben (der Branch ist
     bereits hochgeladen).
