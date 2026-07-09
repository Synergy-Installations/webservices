# CLAUDE.md — synergie.cc website (Syneriemontagen Riegler GmbH)

## Who you are working with

The primary user of this repo is **Michael Riegler** — the business owner. He is
**not a programmer** and describes what he wants in everyday language (usually German).

- **Always answer in German**, in short, simple sentences. No technical jargon —
  explain things in terms of what he sees on the website ("der blaue Knopf auf der
  Kontaktseite"), not in terms of code.
- Never show him raw diffs, stack traces or config dumps unless he asks. Summarize:
  what changed, where he can look at it, what happens next.
- End every step with one clear instruction for him, e.g.:
  „Schau dir die Seite an: http://localhost:3000 — passt das so?"
- The developer behind this setup is **Elias** (eliascerne@icloud.com). Whenever
  something goes beyond simple website changes or you are stuck, say clearly:
  „Da kontaktieren wir am besten Elias."

## The one rule that matters most

**`main` = the live website synergie.cc.** Every push to `main` goes live via Vercel
within minutes. Therefore you NEVER commit, merge or push to `main` yourself, and
you never merge pull requests — hooks in this repo will block you if you try.
**Publishing always goes through a pull request that Elias reviews and merges.**
The way to submit is `pnpm submit` (see workflow step 5).

Branches other than `main` are safe: pushing them only creates a private Vercel
preview URL, never touches the live site.

## Standard workflow for every change

1. **Branch first.** If this is a new topic (not a follow-up to the branch you are
   already on):
   ```
   git switch main
   git pull --ff-only origin main
   git switch -c michael/<kurzer-name>
   ```
   Branch names: lowercase ASCII, hyphens, no umlauts, never contain the word "main"
   (e.g. `michael/telefonnummer-footer`). Follow-up tweaks to work in progress stay
   on the current branch.

2. **Dev server.** Check whether something already listens on port 3000
   (`lsof -ti:3000`). If not, start `pnpm dev` from the repo root **in the
   background** and wait until it is ready. Then open the changed page for Michael:
   `open http://localhost:3000/...`. Never start a second dev server.

3. **Make the change**, then run `pnpm lint` and `pnpm type-check`. Fix what they
   report before showing Michael anything.

4. **Preview.** When Michael is happy with it locally and wants others to see it, or
   before submitting: commit with a short descriptive message, then
   `git push -u origin <branch>`. Vercel automatically builds a preview at:
   `https://webservices-frontend-git-<branch-slug>-synergy-installations.vercel.app`
   where `<branch-slug>` is the branch name lowercased with every non-alphanumeric
   character replaced by `-` (e.g. `michael/telefon-footer` →
   `michael-telefon-footer`). Ready ~2–3 minutes after pushing. Give Michael this
   exact URL.

5. **Publish — via pull request, only on explicit request.** When Michael says the
   change should go live ("live schalten", "veröffentlichen", "auf die echte
   Seite"), confirm once: „Soll ich das zur Veröffentlichung an Elias schicken?"
   If yes → run `pnpm submit`. The script pushes the branch and opens a pull
   request; **only Elias merges to main and thereby puts it live.** Tell Michael:
   die Änderung ist eingereicht, Elias prüft sie und schaltet sie frei — sie ist
   noch NICHT auf synergie.cc. Never merge the PR yourself, never use
   `gh pr merge`.

6. **After Elias merged** (Michael says it's live / a new topic starts): begin the
   next change fresh from step 1 — switch to `main`, pull, new branch. Delete old
   fully-merged `michael/*` branches with `git branch -d` (lowercase -d only).

## Where things live (what Michael's changes usually touch)

| What Michael asks for | Where to edit |
|---|---|
| Texts on the website (German) | `packages/frontend/shared/internationalization/messages/at-AT.json` |
| English texts | `packages/frontend/shared/internationalization/messages/en.json` — **always update both files**; translate yourself |
| Pages of the public website | `apps/frontend/src/app/[locale]/(landing-page)/` |
| Shared UI components (buttons, sections…) | `packages/frontend/ui/` |
| Images, PDFs, static files | `apps/frontend/public/` |
| Styling | Tailwind CSS classes in the components; shared config in `packages/frontend/shared/config-tailwind/` |

URLs are locale-prefixed: `http://localhost:3000/at-AT/...` (German, default) and
`http://localhost:3000/en/...`.

Monorepo facts: pnpm workspace + Turborepo, single Next.js 14 app in
`apps/frontend`. **Always use `pnpm`, never npm or yarn.** Run `pnpm install` after
pulling if dependencies changed.

## Caution zones — do NOT touch without Elias

If Michael's request would require changing any of these, stop and explain that
this needs Elias:

- Database scripts (`pnpm db:*`) and anything under `scripts/` touching MongoDB
- `packages/frontend/backend/` (dashboard backend, Montagekalender logic)
- The dashboard app: `apps/frontend/src/app/[locale]/(dashboard)/`
- API routes: `apps/frontend/src/app/[locale]/api/` and `src/middleware.ts`
- Authentication (Clerk), e-mail sending (SendGrid/Resend), Trigger.dev
- `.env` files / `sendgrid.env` — never read, print, edit or commit these
- Dependency upgrades in any `package.json`

Pure text changes inside dashboard pages are OK; logic changes are not.

## When something goes wrong

- Dev server won't start after pulling: run `pnpm install`, then retry once.
- Weird build/typescript errors you can't fix in a few attempts, git states you
  don't understand, anything involving the caution zones: don't experiment.
  Summarize the problem in plain German and recommend contacting Elias.
- Never use `git reset --hard`, force pushes, or delete branches that are not
  fully merged `michael/*` branches (the hooks block most of this anyway).
