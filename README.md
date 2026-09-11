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
  into progress and BMI.
- **Member progress tracking** - weight logging, body measurements, a goal
  (with an auto-computed progress bar toward the target weight), a
  weight-over-time chart, and BMI derived live from the latest weight +
  stored height (never stored redundantly).
- **BMI calculator** - standalone page, instant client-side calculation
  (no server round trip needed for a pure formula).
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
- pnpm 10+ (`corepack enable && corepack prepare pnpm@latest --activate` if you don't have it)
- PostgreSQL 16+ (or Docker)
- Git

## Setup

```bash
git clone <repository-url>
cd gymflow
pnpm install               # also runs `prisma generate` via postinstall
cp .env.example .env       # then edit .env - see below
docker compose up -d       # local Postgres, if not using Neon/Supabase
pnpm db:migrate            # creates the schema (prompts for a migration name the first time)
pnpm db:seed               # creates a demo gym, admin, and 3 members
pnpm dev
```

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
│   ├── admin/            # dashboard, members CRUD, record-payment, workouts & settings (placeholder pages)
│   ├── member/           # member dashboard
│   └── layout.tsx, error.tsx, loading.tsx, not-found.tsx, globals.css
│
├── modules/
│   ├── auth/             # session (Node), jwt (Edge+Node shared), password, guards, actions, validation
│   ├── members/          # service, actions, validation, member-id generator
│   ├── payments/         # service, actions, validation, expiry (pure fn), providers/
│   ├── progress/         # service, actions, validation, bmi.ts + goal-progress.ts (pure fns)
│   └── dashboard/         # admin dashboard aggregate stats
│
├── components/
│   ├── ui/               # button, input, label, textarea, select, card, badge, table
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
  not in `schema.prisma`.
- The client is generated to `src/generated/prisma` (gitignored,
  regenerated by `pnpm db:generate`, which also runs automatically via
  `postinstall`) rather than `node_modules/.prisma/client`.
- `PrismaClient` requires an explicit driver adapter now - see
  `src/lib/db.ts`, which wires up `@prisma/adapter-pg` over a `pg` `Pool`.
- Every `db.$transaction(...)` call passes `DB_TRANSACTION_OPTIONS`
  (`config/constants.ts`) - wider `maxWait`/`timeout` values than Prisma's
  defaults. Serverless Postgres that scales to zero when idle (Neon's free
  tier, Supabase's pooler) can take several seconds to wake a suspended
  compute back up before the first connection succeeds, which otherwise
  surfaces as Prisma error P2028 ("Unable to start a transaction in the
  given time").

## What's next

Modeled in the database, not yet wired to a page:

- Workout plan admin UI (`/admin/workouts` is a placeholder)
- Member profile editing
- Attendance ingestion endpoint and admin settings page
- The full marketing landing page (facilities, plans, testimonials) - the
  public `/` route is a minimal placeholder today
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
