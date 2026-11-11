# 🏋️ GymFlow

---

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-GYMFLOW--THREE--XI.VERCEL.APP-d4ff00?style=for-the-badge&labelColor=3a3a3a)](https://gymflow-three-xi.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white&labelColor=3a3a3a)
![React](https://img.shields.io/badge/React-19-149eca?style=flat&logo=react&logoColor=white&labelColor=3a3a3a)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat&logo=typescript&logoColor=white&labelColor=3a3a3a)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-0ea5b7?style=flat&logo=tailwindcss&logoColor=white&labelColor=3a3a3a)
![Prisma](https://img.shields.io/badge/Prisma-7-5a67d8?style=flat&logo=prisma&logoColor=white&labelColor=3a3a3a)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-1f9d6b?style=flat&logo=postgresql&logoColor=white&labelColor=3a3a3a)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6e9f18?style=flat&logo=vitest&logoColor=white&labelColor=3a3a3a)
![Hosting](https://img.shields.io/badge/Hosting-Vercel-000000?style=flat&logo=vercel&logoColor=white&labelColor=3a3a3a)

A membership, payments, and fitness-tracking platform for a single gym today,
architected for multiple locations later. Two roles: **Admin** (gym owner/staff)
and **Member**.


![Dashboard](image.png)

## What's implemented right now

- **Auth** - Argon2id-hashed passwords, signed HttpOnly session cookies (admin
  and member are independent sessions), Edge middleware route protection,
  rate-limited login, audit logging. **Members sign in with their member ID
  or their mobile number** - see [Signing in by mobile number](#signing-in-by-mobile-number).
  A member the front desk switches off is signed out on their next request,
  not when their 7-day cookie runs out.
- **Members** - full CRUD (create, edit, deactivate/reactivate), search,
  status filtering, pagination, sequential member-ID generation. Where a
  member stands (Active, Expiring soon, Expired, No plan yet, Inactive) comes
  from one module - see [Membership states](#membership-states).
- **Payments** - record a payment, membership expiry auto-extends using the
  rule in [Membership expiry logic](#membership-expiry-logic), full payment
  history per member.
- **Admin dashboard** - money first (collected this month vs last month,
  collected today), then current / new members, a six-month revenue chart,
  and a **Renewals due** list (ending in the next 7 days, or lapsed in the
  last 30, most urgent first) where
  each row has Call, WhatsApp-reminder and Renew buttons. The member list has
  the same one-tap Call / WhatsApp / Renew actions, and searches by name,
  mobile number or member ID.
- **Member dashboard** - a days-left ring for the membership, today's
  workout with a one-tap "Mark as done", a week strip, and the payment
  history. On a phone it has a bottom tab bar, like an app.
- **Member progress tracking** - weight logging, body measurements, a goal
  (with an auto-computed progress bar toward the target weight), a
  weight-over-time chart, and BMI derived live from the latest weight +
  stored height (never stored redundantly).
- **BMI calculator** - standalone page, instant client-side calculation
  (no server round trip needed for a pure formula).
- **Workout plans** - admin builds a per-member plan (days containing
  exercises, added/removed dynamically); the member sees a read-only view.
  The form submits the whole plan each time, and it is saved *in place*: a
  day that stays keeps its identity (and the member's ticks on it), a day
  that is removed takes its ticks with it, so a plan can still be edited
  after a member has started ticking days off.
  Exercises are **picked, not typed**: choose a muscle group, then choose
  from only that group's exercises (570 in total, from the gym's own
  spreadsheet). Members see each exercise with a "Watch video" link where a
  demonstration exists. See [Exercise catalog](#exercise-catalog).
  Members can **tick off a day** as done (and undo it the same day); the
  admin plan stays read-only to members. Completion is stored per member and
  per day of the gym's own calendar (IST), so a late-night workout lands on
  the right date.
- **Settings** - admin can edit the gym's name/phone/email/address/city,
  stored in the database (not env vars) - the admin sidebar and member
  header both reflect the current name live after a save.
- **Member profile** - self-service editing of contact details, plus a
  password change that requires the current password first (a valid
  session alone isn't enough to silently take over the account). Admins
  reset their own password separately via `pnpm admin:reset-password` -
  there's no UI for that yet (see [Scripts](#scripts)).
- **Black theme everywhere** - the public site, sign-in pages, and the admin
  and member dashboards share one dark theme with a lime accent. The public
  site is built from the owner's reference screenshots: full-bleed hero, About, Training, "How
  joining works", Membership plans, Contact, closing banner, and footer,
  plus the FAQ, privacy policy, and sign-in pages in the same style. All
  wording, photos, and prices live in one file, `src/config/marketing.ts`
  (see [Editing the public website](#editing-the-public-website)). Mobile
  layout covers the whole app: phone, tablet and laptop were each checked
  (see [Testing](#testing)). Admin uses a sidebar from tablet width up and a
  top bar on a phone; the member list is a card list below 1280px and a
  table above it, so nothing ever scrolls sideways.
- **Installable as an app (PWA)** - see [Installing it like an app](#installing-it-like-an-app).
- **Admin can reset a locked-out member's password** directly from the
  member detail page - previously the only password-reset path
  (`pnpm admin:reset-password`) only touched the Admin table, so a member
  who forgot their password had no recovery route at all.
- Database schema for **everything** in the original spec (progress
  tracking, workout plans, attendance, audit log) - see
  [What's next](#whats-next) for what's modeled but not yet wired to a page.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + React 19 |
| Styling / components | Tailwind CSS v4 + a small in-repo shadcn-style component set (Radix-free native elements) |
| Animation | Motion (`motion/react`) - installed, not yet used by anything built so far |
| Database | PostgreSQL (Neon in production, any Postgres locally) |
| ORM | Prisma 7 (driver-adapter based - see [Prisma 7 notes](#prisma-7-notes)) |
| Auth | Custom sessions (`jose` for Edge-compatible JWTs) + Argon2id |
| Validation | Zod |
| Forms | React Hook Form + `@hookform/resolvers` |
| Charts | Recharts (member weight chart, admin revenue chart) |
| Payments | Provider-agnostic `Payment` model; manual methods (cash/UPI/card/bank transfer) implemented, Razorpay adapter stubbed |
| Deployment | Vercel |
| Package manager | pnpm |
| Runtime | Node.js 24 LTS |

## Requirements

- Node.js 24 LTS
- pnpm - version pinned via `packageManager` in `package.json` (currently
  10.34.5). If you don't have pnpm yet: `corepack enable && corepack
  prepare pnpm@10.34.5 --activate`. Don't use `pnpm@latest` here - pnpm 12+
  ships as a native executable that Corepack's Windows support doesn't
  reliably handle yet.
- A free [Neon](https://neon.tech) Postgres project for production (or any
  Postgres for local development - the right driver is picked automatically,
  see [Prisma 7 notes](#prisma-7-notes))
- Git

## Setup

```bash
git clone <repository-url>
cd gymflow
pnpm install               # also runs `prisma generate` via postinstall
cp .env.example .env       # then edit .env - see below
docker compose up -d       # local Postgres (or point DATABASE_URL at a Neon dev branch)
pnpm db:migrate            # creates the schema (prompts for a migration name the first time)
pnpm db:seed               # creates a test gym, an admin, and 8 test members
pnpm dev
```

`docker compose up -d` works again: a `localhost` connection string uses the
plain `pg` driver, and a `*.neon.tech` one uses Neon's. Override the guess
with `DATABASE_DRIVER=neon` or `DATABASE_DRIVER=pg` if you ever need to.

Open:

- `http://localhost:3000/admin/login` - `owner@gymflow.dev` / `Owner@12`
- `http://localhost:3000/member/login` - any row below, password `Member@12345`

### Test members

`pnpm db:seed` creates eight members, each in a different situation, so every
screen and empty state can be tried without typing anything in. Dates are
relative to the day you run it, so "ends in 5 days" stays true. A member can
sign in with either the ID or the mobile number.

| Member ID | Mobile | Name | Situation |
|---|---|---|---|
| `GYM-0001` | 9876500001 | Ananya Sharma | Active, 60 days left, full data (weight chart, goal, plan) |
| `GYM-0002` | 9876500002 | Rahul Verma | Ends in 5 days - appears in Renewals due |
| `GYM-0003` | 9876500003 | Priya Nair | Lapsed 12 days ago - can still sign in, sees a renewal prompt |
| `GYM-0004` | 9876500004 | Arjun Mehta | Joined today, no payment, no plan - every empty state |
| `GYM-0005` | 9876500005 | Simran Kaur | Deactivated - cannot sign in |
| `GYM-0006` | 9876500006 | Vikram Singh | Active, 64 days left, five payments, a workout today |
| `GYM-0007` | 9876500007 | Neha Gupta | Active, 18 days left, no height / weight / plan |
| `GYM-0008` | 9876500008 | Karan Malhotra | Ends in 3 days - the most urgent renewal |

**These passwords are public, and the seed refuses to run when `NODE_ENV` is
`production` or `VERCEL` is set. Never run it against a real gym's database:**
the test members would show up in the owner's member list and revenue
totals. The seed also never overwrites an existing gym profile, so the real
gym's name, phone and address have to be entered once in **Admin -> Settings**
(the seed's "CGR Fitness Club" details only apply to a fresh test database).

### Environment variables

```env
DATABASE_URL="postgresql://gym:gym@localhost:5433/gymflow"
DIRECT_URL="postgresql://gym:gym@localhost:5433/gymflow"
SESSION_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_GYM_NAME="Your Gym"
NEXT_PUBLIC_GYM_PHONE="+91XXXXXXXXXX"
NEXT_PUBLIC_GYM_EMAIL="gym@example.com"
```

**On Neon, `DATABASE_URL` and `DIRECT_URL` must be genuinely different
values** - the pooled connection string (hostname has `-pooler` in it) for
`DATABASE_URL`, and the direct connection string (no `-pooler`) for
`DIRECT_URL`. Neon's dashboard shows both under Connection Details. Using
the pooled string for both will make `pnpm db:migrate` unreliable - see
[Prisma 7 notes](#prisma-7-notes).

Generate `SESSION_SECRET` (48+ random bytes, base64):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

`src/lib/env.ts` validates all of this at startup with Zod - a missing or
too-short `SESSION_SECRET` fails the build/boot immediately instead of
surfacing as a confusing error the first time someone logs in.

## Signing in by mobile number

On the member sign-in page the first field is "Member ID or mobile number".
Either works, with the same password:

- Member ID: any case, extra spaces ignored (`gym-0006`, `  GYM-0006 `).
- Mobile: the ten digits, or with `+91`, `91`, a leading `0`, spaces or
  dashes (`98765 00006`, `+91 98765 00006`, `098765-00006`).

How it fits together:

- Mobile numbers are stored in one canonical form (the ten digits) by
  `src/lib/phone.ts`, which normalizes on every create and edit. A number can
  belong to one member per gym: saving a duplicate shows a clear error
  instead of making two accounts that both match the same sign-in.
- Sign-in looks the member up by ID **or** by any spelling of the stored
  number, so members created before this feature (whose numbers may have
  been saved with spaces or `+91`) still work without a data migration.
- The "wrong ID/number or password" message is the same for every failure,
  and the rate limit is keyed on the identifier, so the form can't be used
  to find out which numbers belong to members.
- The helpers in `phone.ts` also build the one-tap links used by the admin
  screens: `tel:` for Call and `https://wa.me/91XXXXXXXXXX?text=...` for a
  WhatsApp message (opens WhatsApp with the text ready; nothing is sent by
  the app itself and there is no WhatsApp API fee).

## Installing it like an app

The site is an installable web app (a PWA). On a member's phone, "Add to
Home Screen" (Chrome menu on Android, Share menu in Safari on iPhone) puts an
icon on the home screen that opens the member dashboard full-screen, with no
browser bars. There is no app store, no fee and no second codebase.

- `src/app/manifest.ts` sets the name, colours, start page (`/member`) and
  two shortcuts (today's workout, progress). The name follows
  `NEXT_PUBLIC_GYM_NAME`.
- The icons are a plain "CGR" monogram: `public/icons/icon-192.png`,
  `icon-512.png`, `icon-maskable-512.png` (extra padding, so Android can crop
  it into a circle), plus `src/app/icon.png` (browser tab) and
  `src/app/apple-icon.png` (iPhone). **Replace them with the gym's logo** at
  the same file names and sizes when there is one.
- It is not an offline app: there is no service worker, so it needs a
  connection like any website. That is deliberate - membership status and
  payments should never be shown from a stale copy.

## Scripts

```bash
pnpm dev / build / start
pnpm lint          # eslint .
pnpm typecheck     # tsc --noEmit
pnpm db:generate / db:migrate / db:migrate:deploy / db:seed / db:studio / db:reset
pnpm test / test:watch
pnpm admin:reset-password <email> <new-password>   # the only way to change an admin's password today
```

## Project structure

The core domain logic is grouped **by feature**, not by layer - everything
about payments (service, validation, types, Server Actions, provider
adapters) lives under `src/modules/payments/`, rather than being split
across `lib/services/`, `lib/validation/`, `actions/`, and `types/` the way
a purely layered structure would. Less hunting across the tree as a
feature grows.

```text
prisma/
├── schema.prisma        # every entity in the spec, not just what has a UI yet
└── seed.ts

src/
├── app/
│   ├── (auth)/admin/login, (auth)/member/login
│   ├── admin/            # dashboard, members CRUD, record-payment, workouts, settings
│   ├── member/           # member dashboard
│   └── layout.tsx, error.tsx, loading.tsx, not-found.tsx, globals.css
│
├── modules/
│   ├── auth/             # session (Node), jwt (Edge+Node shared), password, guards, actions, validation
│   ├── members/          # service, actions, validation, member-id generator, access (may this session continue?)
│   ├── membership/       # state (pure: where a member stands), query (the same rules as Prisma filters)
│   ├── payments/         # service, actions, validation, expiry (pure fn), providers/
│   ├── progress/         # service, actions, validation, bmi.ts + goal-progress.ts (pure fns)
│   ├── workouts/         # service, actions, validation (nested day/exercise plan editor)
│   ├── gym/              # service, actions, validation - gym profile settings
│   └── dashboard/         # admin dashboard aggregate stats
│
├── components/
│   ├── ui/               # button, input, label, textarea, select, card, badge, table
│   ├── marketing/        # navbar, hero, about, services, join-steps, membership-plans, contact, cta-banner, footer, auth-shell
│   ├── admin/, member/, shared/
│
├── lib/                  # db, env, dates, currency, rate-limit, audit, errors, action-result, utils
└── config/               # site, navigation, constants

middleware.ts             # Edge route guard for /admin/* and /member/*
tests/
├── unit/                 # bmi, membership-expiry, membership-state (pure functions, no DB needed)
└── integration/           # tenant-isolation, membership-parity, workout-plan-edit, ... (need a real test database)
```

## Architecture

```text
Route / Server Action -> Zod validation -> modules/<feature>/service.ts -> Prisma -> PostgreSQL
```

- Server Components for read-heavy pages; Client Components only where a
  form needs interactivity (login, member form, payment form).
- **Two independent auth layers**: `middleware.ts` blocks unauthenticated
  requests to `/admin/*` and `/member/*` before a page renders (Edge
  runtime, `jose`-verified JWT); `modules/auth/guards.ts` checks again
  inside every Server Component/Action, because Server Actions can be
  invoked directly and bypass route-level middleware matching.
- Every tenant-owned table carries `gymId`, and every query in
  `modules/*/service.ts` filters by it. The active `gymId` always comes
  from the authenticated session, never from a client-supplied value -
  this is what `tests/integration/tenant-isolation.test.ts` checks.
- `Payment` stores `method`, `provider`, `providerPaymentId`, `status` so
  manually-recorded cash/UPI/card payments and a future Razorpay/Stripe
  flow share one domain model (`modules/payments/providers/`).

## Membership expiry logic

Implemented as a pure function - `modules/payments/expiry.ts` - unit tested
in `tests/unit/membership-expiry.test.ts`:

- If the current membership is still active on the payment date, the new
  duration is **appended** to the existing expiry.
- If it has already lapsed (or never existed), the new window starts from
  the payment date instead.

```text
Current expiry: 2026-12-15, payment: 1 month -> new expiry: 2027-01-14
Current expiry: 2026-08-15 (expired), payment date 2026-09-09, 1 month -> new expiry: 2026-10-09
```

## Membership states

Where a member stands is **derived, never stored**: a membership runs out on
its own with no event to hang an update on, so the state is computed from two
columns on `Member` (`active`, `membershipEnd`) plus "now". It is defined once,
in `modules/membership/state.ts`, and everything else asks that module.

| State | Meaning | Badge | Next action |
|---|---|---|---|
| `NEW` | joined, never paid | No plan yet | Add a first payment |
| `ACTIVE` | paid, more than 7 days left | Active | none |
| `EXPIRING` | 7 days or fewer left (0 on the last paid day) | Expiring soon | Renew |
| `EXPIRED` | the last paid day has passed | Expired | Renew |
| `INACTIVE` | switched off by an admin (wins over the rest) | Inactive | Reactivate |

Rules that hold on every screen:

- **Days are the gym's own calendar days (IST)**, not the server's (UTC).
- **A membership is valid for the whole of its last paid day.** "Valid till
  19 Nov" means 19 Nov at 8 pm still counts; it ends at midnight.
- **"Expiring soon" is 7 days** everywhere (`EXPIRING_SOON_DAYS` in
  `config/constants.ts`). The dashboard's 7 / 15 / 30 day links only widen the
  *Expiring* list (`?status=EXPIRING&within=30`).
- **"Current members"** (the dashboard tile) = may walk in today = active
  account and last paid day not passed = `ACTIVE` + `EXPIRING`. The members
  list's "Expired" filter also includes members who never paid (they need a
  payment too).

Two forms of the same rule exist, because a badge is drawn in TypeScript and a
list or count is computed by Postgres: `getMembership()` (`state.ts`) and the
`where` builders (`query.ts`: `membershipWhere`, `canEnterWhere`,
`endsWithinDays`, `renewalsDueWhere`).
`tests/integration/membership-parity.test.ts` checks both give the same answer
for ~60 members on every boundary at six moments of the day, so they cannot
drift apart unnoticed.

**Changing a rule:** edit `state.ts` and `query.ts` together and run
`pnpm test`; the parity test fails if they disagree. **Adding a state:** add it
to `MEMBERSHIP_STATES`; the display table (`MEMBERSHIP_DISPLAY`) will not
compile until it has a label, colour and next action. Do not write
`membershipEnd < now` anywhere else.

`canEnterWhere()` is also the allow-list query for the planned fingerprint
door sensor (see [What's next](#whats-next)).

## Security

- Argon2id password hashing; passwords are never logged or returned from
  any query (`select` projections are used anywhere a full row isn't needed).
- HttpOnly, `Secure` (in production), `SameSite=Lax` session cookies.
- Every mutation is re-validated and re-authorized server-side - the
  client's role is never trusted.
- A member session is a signed cookie, so it is re-checked against the
  database on every member request: an account switched off (or removed)
  is signed out through `/member/session-ended`, which clears the cookie.
  Admin sessions are not re-checked yet.
- Login is rate-limited per IP+identifier (see the in-memory limiter's
  multi-instance caveat in `src/lib/rate-limit.ts`).
- Administrative mutations are written to `AuditLog`.
- `tests/integration/tenant-isolation.test.ts` must always pass.

## Prisma 7 notes

Prisma 7 changed a few things this codebase relies on, in case anything
looks unfamiliar coming from Prisma 5/6 examples online:

- The datasource URL and the seed command live in **`prisma.config.ts`**,
  not in `schema.prisma` - and it's deliberately pointed at `DIRECT_URL`,
  not `DATABASE_URL`. The CLI (migrate, studio, db pull) needs a direct,
  non-pooled connection for the advisory locks and prepared statements it
  uses; the running app uses the pooled `DATABASE_URL` instead, via the
  adapter in `src/lib/db.ts`. Pointing the CLI at a pooled connection
  (Neon's `-pooler` endpoint, PgBouncer, etc.) can surface as anything
  from a flat "can't reach database server" to a migration lock timeout,
  since poolers don't support those session-level operations reliably.
- The client is generated to `src/generated/prisma` (gitignored,
  regenerated by `pnpm db:generate`, which also runs automatically via
  `postinstall`) rather than `node_modules/.prisma/client`.
- `PrismaClient` requires an explicit driver adapter now. `src/lib/prisma-adapter.ts`
  chooses it from the connection string: `@prisma/adapter-neon` (Neon's own
  WebSocket-based driver, `@neondatabase/serverless`) for a `*.neon.tech`
  host, and the generic `@prisma/adapter-pg` + `pg` for anything else, such
  as the `docker compose` database. `src/lib/db.ts`, `prisma/seed.ts` and
  `scripts/reset-admin-password.ts` all go through that one function.
- **This app deploys to Vercel's serverless functions, which is exactly
  why the Neon-specific adapter matters, not just a generic Postgres one.**
  A traditional `pg.Pool` opens a fresh TCP+TLS connection on every cold
  serverless invocation (each one is an isolated process with no memory of
  a previous connection) - combined with Neon's free-tier compute waking
  from idle, that was occasionally exceeding even a generous
  `$transaction` timeout and surfacing as Prisma error P2028 ("Unable to
  start a transaction in the given time"). Neon's driver avoids the
  per-invocation TCP handshake entirely. This is Prisma's own documented
  recommendation for deploying to Vercel with Neon.
- Every `db.$transaction(...)` call also passes `DB_TRANSACTION_OPTIONS`
  (`config/constants.ts`) - wider `maxWait`/`timeout` than Prisma's
  defaults, as a second line of defense on top of the driver change above.
- **If this app ever moves off Neon** (Supabase, self-hosted Postgres,
  etc.), nothing needs swapping: a non-Neon hostname already uses `pg`. Set
  `DATABASE_DRIVER=pg` if a custom domain in front of Neon confuses the
  detection. The Neon driver only works against Neon's own infrastructure
  (or anything speaking its wire protocol, like Xata).

## Editing the public website

Everything an owner is likely to change is in **`src/config/marketing.ts`**,
so no component needs touching:

- **Photos.** Every photo slot starts as `null` and falls back to a dark
  patterned background, so the site looks finished without photography. To
  use a real photo, put the file in `public/images/` and set its path, e.g.
  `hero: "/images/hero.jpg"`. Sizes and tips: `public/images/README.md`.
  Photos get a dark overlay automatically so white text stays readable.
  There is deliberately no stock or AI-generated photography in the app.
- **Prices.** `MEMBERSHIP_PRICES_INR` is empty on purpose: nothing in the
  system stores official prices (an admin types the amount per payment), so
  any number shown would be a guess. Add only what is true, e.g.
  `{ 30: 1500, 90: 4000 }` (keys are plan lengths in days). A plan with no
  price shows "Ask at the front desk". `tests/unit/plan-pricing.test.ts`
  fails if a key isn't a length the payment form can record.
- **Wording.** Hero, About, Training, joining steps, plan features, and the
  closing banner. Two Training items (strength, cardio) are generic
  assumptions about the gym's equipment and are marked `ASSUMPTION` - edit
  them to match reality.
- **What is intentionally not there.** The reference design has member
  counts, a "years of experience" figure, a star rating, a named customer
  testimonial, sample prices, blog posts, and a newsletter form. None of
  those are real for this gym, so none are shown; "How joining works" takes
  the testimonial's place. Add them back only with real content.

**Theme.** Every page (public site, sign-in, admin, member) uses one black
theme with a lime accent. It is defined once, as CSS variables in the
`@theme` block of `src/app/globals.css`, and every component reads those
variables instead of hard-coding colors - so changing the look means
editing that one block. Notes for anyone touching it:

- Two tokens do jobs a single "background" color can't: `--color-subtle` (a
  translucent white used for hover, table headers, and badges, so it works
  on both the page and on cards) and `--color-line-strong` (borders of form
  fields, chosen to be at least 3:1 against the page and cards).
- Contrast was checked numerically: all text pairs clear WCAG AA (body text
  about 16:1, muted text about 7:1). Re-check if you change a color.
- The one place the palette is repeated by hand is `CHART_COLORS` in
  `components/member/weight-chart.tsx`, because Recharts needs literal
  values, not CSS variables.
- Browser autofill is restyled in `globals.css` (it otherwise paints fields
  pale blue on a dark page).

## Exercise catalog

The 570-exercise library behind the plan editor lives in
`src/modules/workouts/exercise-catalog.ts` (data) and
`exercise-library.ts` (lookups). It is a static file, not a database table:
it is reference content that doesn't vary per gym and nobody edits day to
day, and keeping it in code means no migration and no extra query when the
dropdowns open.

- A plan stores only the exercise **name** (no schema change). Names are
  unique across the whole catalog, so the muscle group and video link are
  always derivable from the name. `tests/unit/exercise-library.test.ts`
  enforces that, plus: only real `http(s)` video links, and no blank names.
- The member workout page is a Server Component, so it looks up video links
  on the server and the catalog is never sent to a member's phone. Only the
  admin plan editor bundles it.
- Exercises already saved under a name that isn't in the catalog (typed by
  hand before this feature existed) are kept and shown as "(custom)" in the
  editor rather than being blanked, and simply have no video link.
- The source spreadsheet only labeled the first row of each block and had
  several mis-grouped blocks, so the muscle groups here are **not** its raw
  labels. The header of `exercise-catalog.ts` lists every correction. In
  short: its "Quads" section was really Quads + Hamstrings + Calves; "Upper
  Traps" was really Traps + Rear Delts; and a ~50 row unsorted tail was
  re-assigned one exercise at a time.
- To change the library, edit `exercise-catalog.ts` directly (keep names
  unique - the test will tell you if you don't). Renaming an exercise that
  is already in a saved plan turns it into a "(custom)" entry there, so
  prefer adding over renaming.

## What's next

Modeled in the database, not yet wired to a page:

- **Fingerprint door sensor.** Today the owner has to re-register a member on
  the sensor by hand whenever they pay. The plan is to let the website do the
  bookkeeping: an endpoint the sensor (or a small bridge program on the front
  desk PC) calls to record entries into `Attendance`, and an "allowed
  members" list - everyone whose membership is currently valid - that the
  bridge reads to enable or disable fingerprints automatically after each
  payment or expiry. How the second half works depends entirely on the
  sensor's brand and model (some push over the network, some only expose a
  vendor SDK on the PC), so it has not been built yet. The `AttendanceDevice`
  and `Attendance` tables already exist, and the seed adds one device. The
  "allowed members" list is already one query: `canEnterWhere()` in
  `modules/membership/query.ts`.
- Wiring `modules/payments/providers/razorpay-provider.ts` up to a real
  checkout flow and webhook route

## Testing

```bash
pnpm test
```

- `tests/unit/` - pure functions (BMI, goal progress percentage, membership
  expiry, phone-number normalization, IST date handling), no database
  required.
- `tests/integration/` - need `DATABASE_URL` pointed at a real
  (disposable/test) Postgres database with migrations applied.
  `tenant-isolation` and `workout-completion` prove nobody can reach another
  gym's data or tick off another member's days; `membership-parity` proves
  the membership rule in TypeScript and in SQL agree; `workout-plan-edit`
  covers editing a plan after ticks exist; `member-access` covers
  switched-off members.
- `vitest.config.ts` aliases the `server-only` package to a stub
  (`tests/stubs/server-only.ts`) so service modules can be imported outside
  Next.js; the real package still guards them in the app.
- Screens were checked in a real browser at phone (390px), tablet (820px)
  and laptop (1366px) widths for page overflow and console errors, for the
  public site, the member app and the admin app. Rerun that after any layout
  change; a page that scrolls sideways on a phone is a bug.

## Production checklist

```text
[ ] Production PostgreSQL configured, `pnpm prisma migrate deploy` run
[ ] Fresh SESSION_SECRET generated, seeded dev credentials never reused
[ ] `pnpm db:seed` NOT run against this database (it is test data only);
    the real admin is created another way, and the gym's details are
    entered in Admin -> Settings
[ ] NEXT_PUBLIC_GYM_NAME set to the real name (it names the installed app)
[ ] Icons in public/icons replaced with the gym's logo, and real photos in
    public/images (the starter photos are low resolution)
[ ] HTTPS + secure cookies on (NODE_ENV=production)
[ ] Tenant isolation + auth tests passing
[ ] Vercel env vars set: DATABASE_URL, DIRECT_URL, SESSION_SECRET,
    NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_GYM_NAME/PHONE/EMAIL
```

## License

Private commercial application. All rights reserved.
