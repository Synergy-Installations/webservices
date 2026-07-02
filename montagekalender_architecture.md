# Assessment 4 — Montagetermin Booking Calendar: Implementation Guide

**Stack:** Next.js (App Router assumed) · MongoDB Atlas (hosted replica set) · Vercel · Bunny.net (file storage) · Anthropic API (existing funnel).
**Status of the codebase:** dashboard exists; **no view-switching menu yet**; **no role distinction** between *Monteur* (installer/crew) and *end-user* (customer requesting a PV project).

## How to use this document

Feed **one phase at a time** to your AI coding assistant. Each phase has a **Goal**, **Steps**, the **schemas/code** that lock the design, and **Acceptance criteria**. Do not advance until the acceptance criteria pass. Treat this file as the single source of truth so the assistant does not re-derive (and drift on) the data model or the concurrency strategy.

Code is shown in **TypeScript** with the **native MongoDB Node driver**. If your project uses JavaScript, drop the types; if it uses Mongoose, translate the collection shapes into schemas and the `createIndex` calls into `schema.index(...)`.

---

## Phase 0 — Locked architecture decisions (do not let the AI re-litigate these)

These are deliberate decisions. They resolve the ambiguities that would otherwise produce inconsistent code.

1. **Granularity is whole-day, team-as-resource.** Installations are day-scale, not hour-scale. A booking occupies one or more **whole working days** for one or more **teams**. There are no intra-day time slots. This single decision makes both the availability query and the double-booking guarantee simple.
2. **Availability is opt-out ("frei, sofern nicht geblockt").** A team is implicitly available on every working day **unless** an explicit block or booking occupies that team-day. Weekends and public holidays are **computed**, never stored.
3. **Working days = Mon–Fri, minus Austrian public holidays (Niederösterreich), minus configured company closures.** Movable feasts (Easter-derived) are computed by a library, never hardcoded.
4. **Free slots derive exclusively from registered, active teams** (Michael's rule: no free team ⇒ no available date).
5. **Three roles:** `admin` (Michael / office, full control), `monteur` (crew, sees/blocks own team), `customer` (end-user, sees only their own project + books/changes their appointment).
6. **The customer picks the start day at the end of the funnel, while unauthenticated**, bound to an existing **inquiry** record. Dashboard access for the customer is provisioned later. Therefore the availability + hold + confirm endpoints must work without a logged-in customer, secured by inquiry-binding + rate limiting. Management views (admin/monteur) are authenticated.
7. **Customer-facing slot computation uses `teamCount = 1`** (conservative ⇒ longer span ⇒ safe). Compressing a job onto **two teams** (which halves the calendar span) is an **office-side** action done after review.
8. **Concurrency correctness lives in the database, not in application logic.** A **unique compound index `{ teamId, dateKey }`** on a single occupancy collection makes a double-booking *physically impossible*. Temporary reservations are the same documents with a **TTL** so abandoned checkouts self-heal. All multi-document writes run inside **Atlas transactions** (Atlas clusters are replica sets, so transactions are available — including on M0).
9. **The Regelwerk (durations, lead times, working days) is configuration**, stored in the DB and cached, because Michael will refine it. Nothing in the rules is hardcoded in business logic.
10. **All date math runs in a fixed timezone, `Europe/Vienna`, on `"YYYY-MM-DD"` date-key strings** — never on raw `Date` objects in UTC. This avoids the classic off-by-one where a Vienna day boundary lands on the previous UTC day.

**Confirm with Michael before/while building:** the exact duration thresholds and lead-time mapping (Phase 2 ships defaults from the meetings); whether a `monteur` may block their own team or only the office may; and whether "more products ⇒ 3 weeks lead time" should later be driven by Assessment 3's real availability data (it is stubbed as config until A3 exists).

---

## Phase 1 — Data model and indexes (MongoDB)

**Goal:** create the collections and, critically, the indexes that enforce correctness.

### Collections

**`teams`** — Montageteams.
```ts
{ _id: ObjectId, name: string, active: boolean, color: string /* hex for calendar */, createdAt: Date }
```

**`users`** — extend the existing users to carry role + team.
```ts
{ _id: ObjectId, email: string, name: string,
  role: "admin" | "monteur" | "customer",
  teamId: ObjectId | null,          // set for monteur
  inquiryIds: ObjectId[] | null,    // set for customer (their project[s])
  /* keep existing auth fields */ createdAt: Date, updatedAt: Date }
```

**`teamDayOccupancy`** — the heart of the system. **One document per (team, day)** that is taken. Unifies holds, bookings, and blocks.
```ts
{ _id: ObjectId,
  teamId: ObjectId,
  dateKey: string,                  // "YYYY-MM-DD" in Europe/Vienna
  type: "hold" | "booking" | "block",
  inquiryId?: ObjectId,             // for hold/booking
  bookingId?: ObjectId,             // for booking
  holdId?: ObjectId,                // for hold (groups a hold's day-docs)
  expiresAt?: Date,                 // ONLY on type "hold" → drives TTL
  reason?: string                   // for block (e.g. "Urlaub")
}
```

**`bookings`** — the human-readable Montagetermin (source of truth for display; the occupancy docs are the source of truth for *availability*).
```ts
{ _id: ObjectId,
  inquiryId: ObjectId,
  teamIds: ObjectId[],              // 1 or 2
  startDate: string, endDate: string, workingDays: string[],  // date-keys
  durationDays: number, teamCount: number, leadTimeWeeks: number,
  status: "confirmed" | "cancelled",
  // snapshot for the job card (denormalised so cards don't need joins):
  customerName: string, phone?: string, email?: string,
  address: string, geo?: { lat: number, lng: number },
  kWp: number, components: string[], documentsUrl?: string /* Bunny */,
  createdAt: Date, updatedAt: Date, createdBy?: ObjectId }
```

**`settings`** — single document `{ _id: "montageScheduling", ... }` (Phase 2).

Reuse your **existing funnel inquiry/project collection** for `inquiryId` references — do not invent a new one.

### Indexes (run once, e.g. in a `scripts/ensure-indexes.ts`)
```ts
// Correctness backbone: a team-day can be claimed at most once.
await db.collection("teamDayOccupancy").createIndex({ teamId: 1, dateKey: 1 }, { unique: true });
// Self-healing holds: delete expired holds; bookings/blocks have no expiresAt so are untouched.
await db.collection("teamDayOccupancy").createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $exists: true } } });
await db.collection("teamDayOccupancy").createIndex({ holdId: 1 });
await db.collection("teamDayOccupancy").createIndex({ bookingId: 1 });
await db.collection("teamDayOccupancy").createIndex({ inquiryId: 1 });
// One active booking per inquiry.
await db.collection("bookings").createIndex(
  { inquiryId: 1 }, { unique: true, partialFilterExpression: { status: "confirmed" } });
await db.collection("bookings").createIndex({ teamIds: 1, startDate: 1 });
await db.collection("users").createIndex({ email: 1 }, { unique: true });
await db.collection("users").createIndex({ role: 1 });
```

**Acceptance criteria:** collections exist; `ensure-indexes` is idempotent; attempting to insert two `teamDayOccupancy` docs with the same `{teamId, dateKey}` throws duplicate-key error `11000`; a `teamDayOccupancy` doc with a past `expiresAt` disappears within ~60 s, while one without `expiresAt` persists.

---

## Phase 2 — Configuration (Regelwerk) + holiday source

**Goal:** make the rules data-driven and the holidays correct.

### Seed `settings` document
```ts
db.collection("settings").updateOne({ _id: "montageScheduling" }, { $setOnInsert: {
  workingWeekdays: [1,2,3,4,5],            // Luxon: 1=Mon … 7=Sun
  durationRules: [                          // first match where kWp <= maxKwp
    { maxKwp: 20,        daysPerTeam: 2 },
    { maxKwp: Infinity,  daysPerTeam: 3 }    // refine upward with Michael (≥30/≥50 kWp etc.)
  ],
  twoTeamHalving: true,                      // 2 teams ⇒ ceil(daysPerTeam / 2)
  bufferDays: 0,                             // Michael says the day-counts already include buffer
  leadBaseWeeks: 2,                          // no material / Kabelweg
  leadHeavyWeeks: 3,                         // more products (e.g. Speicher/Notstrom)
  holdTtlMinutes: 15,
  horizonDays: 120,                          // how far ahead the picker offers slots
  additionalNonWorkingDays: []               // company closures, "YYYY-MM-DD"
}}, { upsert: true });
```
Cache this in memory with a short TTL; expose `getConfig(db)`.

### Holidays
Install `date-holidays` and `luxon`.
```ts
import Holidays from "date-holidays";
// Verify the NÖ state code once: console.log(new Holidays().getStates("AT"))
// Austrian public holidays are almost entirely federal; country-level "AT" already
// covers every work-free day. State only affects Landespatron days, which are NOT
// general work-free days, so "AT" alone is acceptable; pass the state if you want exactness.
const hd = new Holidays("AT");
```

**Acceptance criteria:** `getConfig` returns the seeded object; `hd.isHoliday(new Date("2026-04-06"))` flags **Ostermontag** (a movable feast) as a `public` holiday — proving the library, not a static list, drives this.

---

## Phase 3 — Date + scheduling core (pure functions)

**Goal:** a dependency-free, unit-testable module. No DB access here except where noted.

`lib/scheduling/dates.ts`
```ts
import { DateTime } from "luxon";
import Holidays from "date-holidays";
const TZ = "Europe/Vienna";
const hd = new Holidays("AT");

export const todayKey = () => DateTime.now().setZone(TZ).toISODate()!;
const dt = (key: string) => DateTime.fromISO(key, { zone: TZ });
export const addDays = (key: string, n: number) => dt(key).plus({ days: n }).toISODate()!;

const isWeekend = (key: string, cfg: any) => !cfg.workingWeekdays.includes(dt(key).weekday);
const isHoliday = (key: string) => {
  const r = hd.isHoliday(dt(key).toJSDate());
  return Array.isArray(r) && r.some(h => h.type === "public");
};
export const isWorkingDay = (key: string, cfg: any) =>
  !isWeekend(key, cfg) && !isHoliday(key) && !cfg.additionalNonWorkingDays.includes(key);

export const nextWorkingDay = (key: string, cfg: any) => {
  let k = key; while (!isWorkingDay(k, cfg)) k = addDays(k, 1); return k;
};
export const collectWorkingDays = (startKey: string, count: number, cfg: any) => {
  const out: string[] = []; let k = nextWorkingDay(startKey, cfg);
  while (out.length < count) { if (isWorkingDay(k, cfg)) out.push(k); k = addDays(k, 1); }
  return out;
};
```

`lib/scheduling/rules.ts`
```ts
export const durationDaysPerTeam = (kWp: number, cfg: any) =>
  (cfg.durationRules.find((r: any) => kWp <= r.maxKwp) ?? cfg.durationRules.at(-1)).daysPerTeam;

export const calendarDays = (kWp: number, teamCount: number, cfg: any) => {
  const perTeam = durationDaysPerTeam(kWp, cfg);
  const span = cfg.twoTeamHalving ? Math.ceil(perTeam / teamCount) : perTeam;
  return span + (cfg.bufferDays ?? 0);
};
// Until Assessment 3 exists, derive "material weight" from funnel components.
export const leadTimeWeeks = (components: string[] = [], cfg: any) =>
  components.some(c => /speicher|notstrom|battery|akku/i.test(c)) ? cfg.leadHeavyWeeks : cfg.leadBaseWeeks;
```

**Acceptance criteria (unit tests):** `calendarDays(35, 1, cfg) === 3`; `calendarDays(35, 2, cfg) === 2`; `calendarDays(10, 2, cfg) === 1`; `collectWorkingDays("2026-04-03", 3, cfg)` skips the weekend **and** Ostermontag 2026-04-06, returning `["2026-04-03","2026-04-07","2026-04-08"]`.

---

## Phase 4 — Roles & authentication gate (Monteur vs end-user vs admin)

**Goal:** introduce the role distinction the dashboard currently lacks.

**Steps**
1. Add `role` (+ `teamId` for monteurs) to `users` (Phase 1). Backfill existing accounts: set Michael to `admin`; create `team` docs and assign monteurs.
2. **Surface the role on the session.** If using NextAuth/Auth.js, add it in the callbacks:
   ```ts
   callbacks: {
     async jwt({ token, user }) { if (user) { token.role = user.role; token.teamId = user.teamId; } return token; },
     async session({ session, token }) { session.user.role = token.role; session.user.teamId = token.teamId; return session; }
   }
   ```
   If using a custom session/JWT, include `role` and `teamId` in the payload. Provide a single helper `getSessionUser(): Promise<{ id; role; teamId? } | null>`.
3. **Coarse gate** with `middleware.ts`:
   ```ts
   export const config = { matcher: ["/dashboard/:path*"] };
   // read session; redirect to /login when absent; optionally pre-check role-specific path prefixes.
   ```
4. **Fine gate** in each server component/route: re-check the role server-side (middleware alone is not an authorization boundary).
   ```ts
   const user = await getSessionUser();
   if (!user) redirect("/login");
   if (user.role !== "admin") notFound();   // admin-only views
   ```
5. **Customer onboarding:** the funnel booking is anonymous and tied to `inquiryId`. To later grant a customer dashboard access, create a `customer` user with `inquiryIds` and send a magic-link/invite (reuse existing auth). Do **not** require customer login to book.

**Acceptance criteria:** a `monteur` cannot load an admin route (gets 404/redirect); a `customer` sees only their own inquiry; an unauthenticated request to the availability/hold/confirm endpoints **succeeds** when a valid `inquiryId` is supplied, but management endpoints reject it.

---

## Phase 5 — Dashboard navigation / view menu

**Goal:** add the missing view-switcher; render it role-filtered.

**Steps**
1. Add a dashboard **layout** (`app/dashboard/layout.tsx`) with a persistent sidebar/menu. Read `getSessionUser()` server-side and pass `role` to the nav.
2. Role-filtered nav map:
   ```tsx
   type Role = "admin" | "monteur" | "customer";
   const NAV: Record<Role, { href: string; label: string }[]> = {
     admin:   [{href:"/dashboard/anfragen",label:"Anfragen"},
               {href:"/dashboard/kalender",label:"Kalender"},
               {href:"/dashboard/teams",label:"Teams"},
               {href:"/dashboard/einstellungen",label:"Einstellungen"}],
     monteur: [{href:"/dashboard/kalender",label:"Mein Kalender"}],
     customer:[{href:"/dashboard/projekt",label:"Mein Projekt"}],
   };
   ```
3. Create the route folders so each menu entry resolves. The calendar route is shared (`/dashboard/kalender`) but its data scope differs by role (Phase 8).

**Acceptance criteria:** each role sees only its permitted entries; active-route highlighting works; deep-linking to a forbidden route is blocked by Phase 4 gates.

---

## Phase 6 — Concurrency-safe booking flow (hold → confirm)

**Goal:** book without ever double-booking, and let abandoned checkouts self-heal.

All functions take the Mongo `client` (for sessions) and `db`. Define a `ConflictError`.

### Availability query (read-only; safety is enforced at write time)
`lib/scheduling/availability.ts`
```ts
export async function findAvailableStartDates(db, { kWp, components = [], teamCount = 1 }) {
  const cfg = await getConfig(db);
  const span = calendarDays(kWp, teamCount, cfg);
  const teams = await db.collection("teams").find({ active: true }).toArray();
  const out: any[] = [];
  const limit = addDays(todayKey(), cfg.horizonDays);
  let start = nextWorkingDay(earliestStart(components, cfg), cfg);
  while (start <= limit) {
    if (isWorkingDay(start, cfg)) {
      const need = collectWorkingDays(start, span, cfg);
      const occ = await db.collection("teamDayOccupancy")
        .find({ dateKey: { $in: need } }).project({ teamId: 1, dateKey: 1 }).toArray();
      const busy = new Set(occ.map(o => `${o.teamId}|${o.dateKey}`));
      const free = teams.filter(t => need.every(d => !busy.has(`${t._id}|${d}`)));
      if (free.length >= teamCount)
        out.push({ startDate: start, endDate: need.at(-1), workingDays: need });
    }
    start = addDays(start, 1);
  }
  return out;
}
function earliestStart(components, cfg) { return addDays(todayKey(), leadTimeWeeks(components, cfg) * 7); }
```

### Hold (transaction; unique index rejects the loser of a race)
```ts
export async function createHold(client, db, { inquiryId, startDate, teamCount = 1, kWp, components }) {
  const cfg = await getConfig(db);
  const need = collectWorkingDays(startDate, calendarDays(kWp, teamCount, cfg), cfg);
  const expiresAt = new Date(Date.now() + cfg.holdTtlMinutes * 60_000);
  const holdId = new ObjectId();
  const session = client.startSession();
  try {
    let assigned: ObjectId[] = [];
    await session.withTransaction(async () => {
      const teams = await db.collection("teams").find({ active: true }, { session }).toArray();
      const occ = await db.collection("teamDayOccupancy")
        .find({ dateKey: { $in: need } }, { session }).project({ teamId:1, dateKey:1 }).toArray();
      const busy = new Set(occ.map(o => `${o.teamId}|${o.dateKey}`));
      const free = teams.filter(t => need.every(d => !busy.has(`${t._id}|${d}`)));
      if (free.length < teamCount) throw new ConflictError("SLOT_TAKEN");
      assigned = free.slice(0, teamCount).map(t => t._id);
      const docs = assigned.flatMap(teamId =>
        need.map(dateKey => ({ teamId, dateKey, type: "hold", holdId,
                               inquiryId: new ObjectId(inquiryId), expiresAt })));
      await db.collection("teamDayOccupancy").insertMany(docs, { session, ordered: true });
    });
    return { holdId, teamIds: assigned, workingDays: need, expiresAt };
  } catch (e: any) {
    if (e?.code === 11000) throw new ConflictError("SLOT_TAKEN"); // concurrent hold won the race
    throw e;
  } finally { await session.endSession(); }
}
```

### Confirm (promote hold-docs to booking; create the booking record)
```ts
export async function confirmBooking(client, db, { holdId, snapshot }) {
  const session = client.startSession();
  try {
    let bookingId: ObjectId | null = null;
    await session.withTransaction(async () => {
      const occ = await db.collection("teamDayOccupancy")
        .find({ holdId: new ObjectId(holdId), type: "hold" }, { session }).toArray();
      if (occ.length === 0) throw new ConflictError("HOLD_EXPIRED");
      bookingId = new ObjectId();
      const teamIds = [...new Set(occ.map(o => String(o.teamId)))].map(id => new ObjectId(id));
      const days = [...new Set(occ.map(o => o.dateKey))].sort();
      await db.collection("teamDayOccupancy").updateMany(
        { holdId: new ObjectId(holdId) },
        { $set: { type: "booking", bookingId }, $unset: { expiresAt: "", holdId: "" } },
        { session });                                  // no expiresAt ⇒ TTL ignores ⇒ permanent
      await db.collection("bookings").insertOne({
        _id: bookingId, inquiryId: occ[0].inquiryId, teamIds,
        startDate: days[0], endDate: days.at(-1), workingDays: days,
        status: "confirmed", ...snapshot, createdAt: new Date(), updatedAt: new Date(),
      }, { session });
    });
    return { bookingId };
  } finally { await session.endSession(); }
}
```

### Cancel / reschedule / reassign
- **Cancel:** in a transaction, set `bookings.status="cancelled"` and **delete** that booking's occupancy docs (`{ bookingId }`) — frees the team-days. The partial unique index then permits a fresh confirmed booking for the inquiry.
- **Reschedule:** cancel + new hold/confirm, or move the occupancy docs to new `dateKey`s in a transaction.
- **Reassign team (admin):** in a transaction, change `teamId` on the booking's occupancy docs and update `bookings.teamIds`. The unique index prevents colliding with the target team's existing occupancy (catch `11000` ⇒ surface "target team busy").

**Acceptance criteria:** two **parallel** `createHold` calls for the same date and a single free team → exactly **one** resolves, the other throws `SLOT_TAKEN`. A hold left unconfirmed for `holdTtlMinutes` disappears and the slot reappears in availability. Confirm after expiry throws `HOLD_EXPIRED`. Cancel frees the days.

---

## Phase 7 — API endpoints

**Goal:** thin route handlers wrapping Phase 6; correct authorization per endpoint.

| Method & path | Auth | Body / query | Returns |
|---|---|---|---|
| `GET /api/availability` | public (inquiry-bound) | `inquiryId`, `teamCount?` | `[{ startDate, endDate, workingDays }]` |
| `POST /api/bookings/hold` | public (inquiry-bound), rate-limited | `{ inquiryId, startDate, teamCount? }` | `{ holdId, expiresAt }` or `409 SLOT_TAKEN` |
| `POST /api/bookings/confirm` | public (inquiry-bound) | `{ holdId }` (+ contact captured at funnel end) | `{ bookingId }` or `409 HOLD_EXPIRED` |
| `POST /api/bookings/:id/cancel` | admin, or customer who owns the inquiry | — | `{ ok }` |
| `PATCH /api/bookings/:id` | admin | `{ teamIds?, startDate? }` | updated booking |
| `GET /api/calendar` | admin (all) / monteur (own team) | `from`, `to`, `teamId?` | bookings + blocks in range |
| `POST /api/blocks` / `DELETE /api/blocks/:id` | admin (and monteur for own team, if enabled) | `{ teamId, from, to, reason }` | block day-docs |
| `GET/POST/PATCH /api/teams` | admin | team fields | team(s) |

Implementation notes: derive `kWp`/`components` for hold/availability **server-side from the inquiry** (do not trust the client to send them); rate-limit the public endpoints by IP + `inquiryId`; map `ConflictError` to **HTTP 409** so the client can re-fetch availability and prompt re-selection.

**Acceptance criteria:** each endpoint enforces its row in the table; a customer cannot cancel another inquiry's booking; a monteur's `GET /api/calendar` returns only their team.

---

## Phase 8 — Calendar UI (admin / monteur) with job cards and blocks

**Goal:** the dashboard calendar view, with teams as parallel resources.

**Steps**
1. Use **`react-big-calendar`** (MIT-licensed, supports month/week/day and **resources**). Install it and `date-fns` (or the Luxon localizer).
2. Render **teams as resources** (columns) in week/day view; map each booking to an event with `resourceId = teamId`, `start`/`end` from `workingDays`, and `title = customerName + kWp`. Render **blocks** as events with a distinct muted style and `type="block"`.
3. Color events by team (`teams.color`). Add a **team filter** (all teams for admin; locked to own team for monteur).
4. **Job card:** on event click, open a side panel/modal showing the booking snapshot — customer, address with a **Google Maps deep link** `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, kWp, components, a link to the **Bunny documents URL**, assigned teams, status, and actions (**reassign**, **cancel**, **block/unblock**) gated to `admin`.
5. **Block creation UI:** select team + date range + reason → `POST /api/blocks`. The day expansion (range → working-day docs) happens server-side; surface a warning if a day is already booked (the unique index will reject it).
6. Data: `GET /api/calendar?from&to` on view-range change; the handler returns bookings (`status:"confirmed"`) and blocks for the range, scoped by role.

**Acceptance criteria:** admin sees all teams side by side; monteur sees only their team; a blocked range visibly removes that team's availability; clicking a job shows the full card with a working maps link and PDF link; reassigning a job moves it to another team's column (or warns if that team is busy).

---

## Phase 9 — Customer booking UI (funnel end + project view) + disclaimer

**Goal:** let the customer pick a buildable day at the end of the funnel, with the agreed Richtwert disclaimer.

**Steps**
1. As the final funnel step (after contact data, before submit), call `GET /api/availability?inquiryId=...`. Render bookable **start days** in a simple month picker; non-bookable days are disabled. Show the computed **span** ("voraussichtlich X Arbeitstage") and end date for the chosen day.
2. On selection → `POST /api/bookings/hold` → store `{ holdId, expiresAt }` client-side and show a countdown ("Termin für 15 Min. reserviert"). On funnel submit → `POST /api/bookings/confirm`. On `409` from either, re-fetch availability and ask the customer to re-pick.
3. Expose the same picker read-only/changeable in the customer's `/dashboard/projekt` view.
4. **Richtwert + Abweichungs-Disclaimer** under the picker (German, matching LS-6):
   > *Der angezeigte Termin ist ein Richtwert und wird anhand der verfügbaren Montageteams sowie des hinterlegten Regelwerks (Dauer nach Anlagengröße, Vorlaufzeit nach Materialumfang) bemessen. Abweichungen sind in beide Richtungen möglich (z. B. Wetter, unvorhergesehene Einflüsse).*

**Acceptance criteria:** the customer can pick only buildable days; a held slot blocks others immediately; the booking appears on the admin calendar bound to the inquiry; the disclaimer is visible at the point of selection.

---

## Phase 10 — Notifications (minimal; optional)

**Goal:** keep Michael's "minimalistisch" directive — he explicitly does **not** want constant status emails.

Send **one** notification on a **new confirmed booking** (to office; optionally to the assigned team), and one on **cancellation/reschedule**. Use a Trigger.dev v3 task triggered after `confirmBooking`. Do not emit per-status-change spam. Push/PWA delivery is a separate Leistungsschein (LS-8) — out of scope here.

**Acceptance criteria:** confirming a booking emits exactly one office notification; no notification fires on hold creation or hold expiry.

---

## Phase 11 — Seed data and test scenarios

1. **Seed:** 2–3 `teams` (with colors), a handful of `inquiries` with varying `kWp` and `components`, one `admin`, two `monteur` users (one per team).
2. **Unit tests:** Phase 3 functions (durations, lead time, working-day collection across a weekend + a movable holiday).
3. **Concurrency test (critical):** fire two `createHold` promises for the same start day with a single active team; assert exactly one resolves and the other is `SLOT_TAKEN`. Repeat for `confirmBooking` after manually expiring a hold ⇒ `HOLD_EXPIRED`.
4. **Holiday test:** book across Easter week 2026 and assert Ostermontag (2026-04-06) is never occupied.
5. **Role test:** monteur and customer hitting admin endpoints are rejected; public availability/hold/confirm work without a session.

---

## Phase 12 — Build order checklist

1. Phase 1 collections + indexes → 2. Phase 2 config + holidays → 3. Phase 3 pure functions + their unit tests → 4. Phase 4 roles/auth gate → 5. Phase 5 nav menu → 6. Phase 6 hold/confirm/cancel + concurrency test → 7. Phase 7 API → 8. Phase 8 admin/monteur calendar → 9. Phase 9 customer picker + disclaimer → 10. Phase 10 notifications → 11. Phase 11 full test pass.

Ship Phases 1–9 as the core deliverable (this is the 660 € scope in KV-2026-04); Phase 10 maps to the optional external-calendar/notification work; LS-8 (PWA) and Assessment 3's live availability feed are separate.
