---
name: stand
description: Erklärt Michael in einfachen Worten, wo er gerade steht — welche Änderung in Arbeit ist, was schon in der Vorschau ist und was live ist. Verwenden bei Fragen wie „wo waren wir?" oder „was ist der Stand?".
---

Michael möchte wissen, wo er gerade steht. Sammle die Fakten und erkläre sie auf
Deutsch in einfachen Worten — KEINE Git-Ausgaben zeigen, sondern übersetzen.

1. `git branch --show-current`, `git status`, `git log main..HEAD --oneline` und
   `git log origin/main -3 --oneline` (nach `git fetch origin`) auswerten.
2. `lsof -ti:3000` — läuft der Testserver?
3. Fasse zusammen, z.B.:
   - „Du arbeitest gerade an: <Thema des Branches, in Alltagssprache>."
   - „Diese Änderungen sind noch nicht auf der echten Website: …"
   - „Es gibt noch ungespeicherte Änderungen." / „Alles ist gespeichert."
   - „Der Testserver läuft — schau auf http://localhost:3000." / „… läuft nicht."
4. Schlage den nächsten sinnvollen Schritt vor (weiterarbeiten, `/vorschau`,
   `/live`, oder mit `/aendern` etwas Neues beginnen).
