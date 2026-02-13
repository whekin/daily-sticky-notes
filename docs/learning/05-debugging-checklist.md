# 05 - Supabase Debugging Checklist

## What You're Learning
- A repeatable way to debug data access issues with RLS and RPC.
- How to distinguish env/config errors from policy/function errors.

## Why This Decision Was Made
- Most Supabase issues in early builds come from key mismatch, missing grants, or wrong function signatures.
- A checklist prevents random trial-and-error edits.

## Hands-On Verification Commands
```bash
bun run typecheck
bun run test
curl -i http://localhost:3000/api/v1/health
```

```sql
-- Confirm slug exists
select id, slug, start_date, unlock_hour
from public.gift_settings;

-- Confirm note rows
select gift_id, day_index, body
from public.gift_notes
order by day_index;
```

## If Broken, Check This
- Wrong slug in URL vs `gift_settings.slug`.
- Missing execute grants on RPC functions.
- Bad env var in `.env.local` or Vercel settings.
- `DATABASE_URL` not set for Drizzle commands.
- `SUPABASE_SERVICE_ROLE_KEY` missing for server health/event insert paths.
