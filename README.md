# GymFlow

A membership, payments, and fitness-tracking platform for a single gym today,
architected for multiple locations later. Two roles: **Admin** (gym owner/staff)
and **Member**.

## What's implemented right now

- **Auth** - Argon2id-hashed passwords, signed HttpOnly session cookies (admin
  and member are independent sessions), Edge middleware route protection,
  rate-limited login, audit logging.
- **Members** - full CRUD (create, edit, deactivate/reactivate), search,
  status filtering, pagination, sequential member-ID generation.
- **Payments** - record a payment, membership expiry auto-extends using the
  rule in [Membership expiry logic](#membership-expiry-logic), full payment
  history per member.
- **Admin dashboard** - total/active members, payments today/this month,
  memberships expiring in 7/15/30 days.
- **Member dashboard** - membership status, payment history, quick links
  into every member sub-page.
- **Member progress tracking** - weight logging, body measurements, a goal
  (with an auto-computed progress bar toward the target weight), a
  weight-over-time chart, and BMI derived live from the latest weight +
  stored height (never stored redundantly).
- **BMI calculator** - standalone page, instant client-side calculation
  (no server round trip needed for a pure formula).
- **Workout plans** - admin builds a per-member plan (days containing
  exercises, added/removed dynamically); the member sees a read-only view.
  Editing always replaces the plan wholesale (no per-day diffing) - simple
  and correct for a form that submits the whole plan each time.
- **Settings** - admin can edit the gym's name/phone/email/address/city,
  stored in the database (not env vars) - the admin sidebar and member
  header both reflect the current name live after a save.
- **Member profile** - self-service editing of contact details, plus a
  password change that requires the current password first (a valid
  session alone isn't enough to silently take over the account). Admins
  reset their own password separately via `pnpm admin:reset-password` -
  there's no UI for that yet (see [Scripts](#scripts)).
- **Public landing page** - hero, facilities, membership plan durations
  (reused from the same constant the admin payment form uses, so it can't
  drift out of sync), a "why train here" section, and contact details read
  live from the Gym row. Two intentional departures from the original
  spec: no fabricated testimonials (inventing quotes from fake customers
  isn't something to ship on a real site), and no specific membership
  prices shown (nothing in the schema stores official pricing - an admin
  enters the amount by hand per payment - so a specific number here could
  drift from what's actually charged). Also has an FAQ page and a privacy
  policy page (the latter is a factually accurate starting draft, not
  legal advice - see the disclaimer on the page itself) and a mobile-first
  layout pass across the whole app, not just the landing page (admin now
  has a phone nav bar; every multi-column form drops to one column below
  the `sm` breakpoint).
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
| Database | PostgreSQL |
| ORM | Prisma 7 (driver-adapter based - see [Prisma 7 notes](#prisma-7-notes)) |
| Auth | Custom sessions (`jose` for Edge-compatible JWTs) + Argon2id |
| Validation | Zod |
| Forms | React Hook Form + `@hookform/resolvers` |
| Charts | Recharts - installed, not yet used (no chart-bearing pages built yet) |
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
- A free [Neon](https://neon.tech) Postgres project (see the note under
  Setup for why - the app's driver is Neon-specific)
- Git

## Setup

```bash
git clone <repository-url>
cd gymflow
pnpm install               # also runs `prisma generate` via postinstall
cp .env.example .env       # then edit .env - see below
docker compose up -d       # local Postgres - see note below before using this
pnpm db:migrate            # creates the schema (prompts for a migration name the first time)
pnpm db:seed               # creates a demo gym, admin, and 3 members
pnpm dev
```

**Note on `docker compose up -d`:** this app's code now talks to the
database through Neon's own driver (see [Prisma 7 notes](#prisma-7-notes)),
which only works against Neon's infrastructure, not a plain local Postgres
container - so that command starts a database the app can't actually
connect to, as things stand. Use a free Neon project for local development
too (same as production, just a separate project/branch), or see the
Prisma 7 notes for what to revert if you'd rather run Postgres locally.

Open:

- `http://localhost:3000/admin/login` (seeded admin: `owner@gymflow.dev` / `Admin@12345`)
- `http://localhost:3000/member/login` (seeded member: `GYM-0001` / `Member@12345`)

**Never reuse the seeded credentials outside local development.**

### Environment variables

```env
DATABASE_URL="postgresql://gym:gym@localhost:5432/gymflow"
DIRECT_URL="postgresql://gym:gym@localhost:5432/gymflow"
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
│   ├── members/          # service, actions, validation, member-id generator
│   ├── payments/         # service, actions, validation, expiry (pure fn), providers/
│   ├── progress/         # service, actions, validation, bmi.ts + goal-progress.ts (pure fns)
│   ├── workouts/         # service, actions, validation (nested day/exercise plan editor)
│   ├── gym/              # service, actions, validation - gym profile settings
│   └── dashboard/         # admin dashboard aggregate stats
│
├── components/
│   ├── ui/               # button, input, label, textarea, select, card, badge, table
│   ├── marketing/        # navbar, hero, facilities, membership-plans, why-us, contact, footer
│   ├── admin/, member/, shared/
│
├── lib/                  # db, env, dates, currency, rate-limit, audit, errors, action-result, utils
└── config/               # site, navigation, constants

middleware.ts             # Edge route guard for /admin/* and /member/*
tests/
├── unit/                 # bmi, membership-expiry (pure functions, no DB needed)
└── integration/           # tenant-isolation (needs a real test database)
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

## Security

- Argon2id password hashing; passwords are never logged or returned from
  any query (`select` projections are used anywhere a full row isn't needed).
- HttpOnly, `Secure` (in production), `SameSite=Lax` session cookies.
- Every mutation is re-validated and re-authorized server-side - the
  client's role is never trusted.
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
- `PrismaClient` requires an explicit driver adapter now - see
  `src/lib/db.ts`, which wires up `@prisma/adapter-neon` (Neon's own
  WebSocket-based driver, `@neondatabase/serverless`) rather than the more
  generic `@prisma/adapter-pg` + `pg`.
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
  etc.), swap `@prisma/adapter-neon` + `@neondatabase/serverless` back for
  `@prisma/adapter-pg` + `pg` in `src/lib/db.ts`, `prisma/seed.ts`, and
  `scripts/reset-admin-password.ts` - the Neon driver only works against
  Neon's own infrastructure (or anything speaking its wire protocol, like
  Xata).

## What's next

Modeled in the database, not yet wired to a page:

- Attendance ingestion endpoint
- Wiring `modules/payments/providers/razorpay-provider.ts` up to a real
  checkout flow and webhook route

## Testing

```bash
pnpm test
```

- `tests/unit/` - pure functions (BMI, goal progress percentage, membership
  expiry), no database required.
- `tests/integration/tenant-isolation.test.ts` - needs `DATABASE_URL` pointed
  at a real (disposable/test) Postgres database with migrations applied.

## Production checklist

```text
[ ] Production PostgreSQL configured, `pnpm prisma migrate deploy` run
[ ] Fresh SESSION_SECRET generated, seeded dev credentials never reused
[ ] HTTPS + secure cookies on (NODE_ENV=production)
[ ] Tenant isolation + auth tests passing
[ ] Vercel env vars set: DATABASE_URL, DIRECT_URL, SESSION_SECRET,
    NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_GYM_NAME/PHONE/EMAIL
```

## License

Private commercial application. All rights reserved.
