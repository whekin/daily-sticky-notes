# Valentine App

A fast-iteration learning project using Bun + Next.js + TypeScript + Biome + Tailwind + shadcn/ui, with Supabase + Drizzle + Elysia for data/API.

## Stack
- Next.js App Router (single repo)
- Bun runtime and test runner (`bun test`)
- Biome for lint/format
- Tailwind + shadcn/ui + Framer Motion
- Supabase (RLS + RPC)
- Drizzle schema + migrations
- Elysia for API routes in Next
- Pino + Sentry for observability

## Quick Start
```bash
bun install
cp .env.example .env.local
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `GIFT_SECRET_SLUG`
- `GIFT_START_DATE`
- `GIFT_UNLOCK_HOUR`
- `GIFT_TOTAL_NOTES`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY`
- `PUSH_VAPID_PRIVATE_KEY`
- `PUSH_VAPID_SUBJECT`
- `PUSH_DISPATCH_SECRET`

## Database Setup
1. Create a Supabase project.
2. Run SQL from `drizzle/0000_initial.sql` in Supabase SQL editor.
3. Insert a row in `gift_settings`.
4. Insert day-indexed rows in `gift_notes`.

## Commands
```bash
bun run dev
bun run build
bun run lint
bun run typecheck
bun run test
ENABLE_SOCKET_TESTS=1 bun run test
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
```

`ENABLE_SOCKET_TESTS=1` enables the supertest bridge test that binds a local HTTP listener.

## API Endpoints
- `GET /api/v1/health`
- `GET /api/v1/runtime`
- `POST /api/v1/events/opened`
- `POST /api/v1/notifications/subscriptions`
- `DELETE /api/v1/notifications/subscriptions`
- `POST /api/v1/notifications/dispatch` (requires `x-push-dispatch-secret`)

## Learning Notes
See `/docs/learning`:
- `01-supabase-project-setup.md`
- `02-schema-with-drizzle.md`
- `03-rls-policies.md`
- `04-rpc-and-client-access.md`
- `05-debugging-checklist.md`

See `/docs/codex-workflow.md` for MCP setup and how to collaborate with Codex efficiently.

## CI
GitHub Actions workflow at `.github/workflows/ci.yml` runs:
- Biome
- Typecheck
- Bun tests

## Deployment
Primary path is Vercel + Supabase free tiers.
- PRs -> preview deploys
- `main` -> production deploy
