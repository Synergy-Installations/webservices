#!/usr/bin/env bash
# Submits the current working branch for review: pushes it and opens a pull
# request that Elias reviews and merges (only he publishes to synergie.cc).
# Run via `pnpm submit`. Optional argument: PR title.
set -euo pipefail
cd "$(dirname "$0")/.."

VERCEL_PREFIX="webservices-frontend-git"
VERCEL_SUFFIX="synergy-installations.vercel.app"

branch="$(git branch --show-current)"

if [ -z "$branch" ] || [ "$branch" = "main" ]; then
  echo "FEHLER: Du stehst auf '$branch'. Einreichen geht nur von einem Arbeits-Branch aus (z.B. michael/...)." >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "FEHLER: Es gibt noch nicht gespeicherte (uncommittete) Änderungen. Zuerst committen, dann erneut versuchen." >&2
  exit 1
fi

git fetch origin
if [ -z "$(git log origin/main..HEAD --oneline)" ]; then
  echo "FEHLER: Dieser Branch enthält nichts Neues gegenüber main - es gibt nichts einzureichen." >&2
  exit 1
fi

echo "Lade den Branch zu GitHub hoch ..."
git push -u origin "$branch"

# Vercel slugifies branch names: lowercase, non-alphanumerics become hyphens
slug="$(printf '%s' "$branch" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
preview_url="https://${VERCEL_PREFIX}-${slug}-${VERCEL_SUFFIX}"

title="${1:-Website-Änderung: $branch}"

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  existing="$(gh pr list --head "$branch" --state open --json url --jq '.[0].url' 2>/dev/null || true)"
  if [ -n "$existing" ]; then
    echo "Es gibt bereits einen offenen Pull Request - er wurde soeben aktualisiert:"
    echo "PR: $existing"
  else
    gh pr create --base main --head "$branch" --title "$title" \
      --body "$(printf 'Änderung von Michael, eingereicht über Claude Code.\n\nVorschau: %s\n\nBitte prüfen und mergen — der Merge schaltet die Änderung auf synergie.cc live.' "$preview_url")"
  fi
  echo ""
  echo "ERFOLG: Die Änderung ist eingereicht. Elias prüft sie und schaltet sie live."
else
  echo ""
  echo "HINWEIS: GitHub CLI (gh) ist nicht eingerichtet - der Pull Request muss manuell erstellt werden:"
  echo "https://github.com/Synergy-Installations/webservices/compare/main...$branch?expand=1"
  echo "Der Branch ist aber hochgeladen. Bitte Elias Bescheid geben, er kann den PR auch selbst anlegen."
fi

echo "Online-Vorschau (in ca. 2-3 Minuten bereit): $preview_url"
