# 02 - Schema with Drizzle

## What You're Learning
- How Drizzle schema files represent your Postgres tables.
- How to keep application types aligned with database shape.
- How migration SQL and schema definitions work together.

## Why This Decision Was Made
- Drizzle gives typed models and migration discipline, reducing schema drift.
- The project keeps schema in `src/db/schema.ts` and SQL baseline in `drizzle/0000_initial.sql`.

## Hands-On Verification Commands
```bash
bun run db:generate
bun run db:studio
```

## If Broken, Check This
- `DATABASE_URL` exists and points to your Supabase Postgres connection.
- Table names in SQL and Drizzle schema match (`gift_settings`, `gift_notes`, `gift_events`).
- Unique/check constraints reflect expected behavior (day index and unique day per gift).
