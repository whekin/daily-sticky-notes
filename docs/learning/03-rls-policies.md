# 03 - RLS Policies

## What You're Learning
- How to enable Row Level Security and start deny-by-default.
- Why direct table reads are blocked for `anon` in this project.
- How policy scope changes security posture.

## Why This Decision Was Made
- Secret URL alone is not true access control.
- Restricting table reads and exposing controlled RPCs reduces accidental data leakage.

## Hands-On Verification Commands
```sql
-- In Supabase SQL editor
select relname, relrowsecurity
from pg_class
where relname in ('gift_settings', 'gift_notes', 'gift_events');

-- Validate policies
select policyname, tablename, cmd, roles
from pg_policies
where tablename in ('gift_settings', 'gift_notes', 'gift_events');
```

## If Broken, Check This
- RLS is enabled on all three tables.
- `anon` has no direct `SELECT` policy on settings/notes tables.
- RPC functions are `SECURITY DEFINER` and use `set search_path = public`.
