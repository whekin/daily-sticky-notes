# AGENTS.md

## Mission
- Build a personal Valentine gift app with clean, maintainable code and fast iteration.
- Prioritize correctness, readability, and small vertical slices over large speculative abstractions.

## Stack Contract
- Runtime/package manager: `bun`
- Framework: `next` (App Router, TypeScript)
- API layer: `elysia` mounted in Next route handlers
- Styling: Tailwind + shadcn/ui
- Database: Supabase Postgres + Drizzle schema/migrations
- Observability: Pino + Sentry

## Code Quality Contract
- Strict TypeScript only. Avoid `any`; if unavoidable, annotate with a short rationale.
- Prefer small typed modules with explicit inputs/outputs.
- No dead abstractions or placeholder architecture.
- Keep domain logic in `/src/lib` and avoid duplicating business rules across UI and API.

## Data and RLS Contract
- All schema changes must go through Drizzle schema + SQL migration updates.
- RLS must remain enabled on user-facing tables.
- Client reads should prefer RPCs with `SECURITY DEFINER` when table-level access is restricted.
- Review RLS and RPC implications for every data-access change.

## Logging and Errors
- Use `pino` for server logs.
- Avoid ad-hoc `console.log` in application code.
- Capture production errors with Sentry where feasible.

## Testing Contract
- Required commands before merging:
  - `bun run lint`
  - `bun run typecheck`
  - `bun run test`
- New feature work should include or update tests for:
  - business logic
  - API behavior
  - edge cases that can regress silently

## Collaboration Workflow
- Plan first for non-trivial work.
- Implement in small vertical slices.
- Verify with tests and typecheck after each meaningful slice.
- Document decisions briefly in docs when they affect architecture or ops.
