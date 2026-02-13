# 04 - RPC and Client Access

## What You're Learning
- How the browser can safely read data through RPC functions.
- Why RPC return shapes become your frontend contract.
- How timezone-aware unlock logic can live in SQL.

## Why This Decision Was Made
- You wanted client-direct Supabase usage to learn RLS.
- RPC keeps client access simple while preserving restricted base table access.

## Hands-On Verification Commands
```sql
-- In Supabase SQL editor
select * from public.rpc_get_unlock_context('your-slug', 'Europe/Warsaw');
select * from public.rpc_get_unlocked_notes('your-slug', 'Europe/Warsaw');
select * from public.rpc_get_today_note('your-slug', 'Europe/Warsaw');
```

```bash
curl -s http://localhost:3000/api/v1/runtime | jq
```

## If Broken, Check This
- RPC argument names match app code: `p_slug`, `p_tz`.
- RPC execution is granted to `anon` and `authenticated`.
- Timezone value is valid (`pg_timezone_names`), otherwise logic falls back to UTC.
