# 01 - Supabase Project Setup

## What You're Learning
- How Supabase projects map to environment variables.
- Difference between public (`anon`) and server-only (`service_role`) credentials.
- How to separate local, preview, and production environments.

## Why This Decision Was Made
- This app uses client-direct reads via RPC + RLS, so key separation matters.
- You need one project URL, one `anon` key, and one `service_role` key to support UI + server operations.

## Hands-On Verification Commands
```bash
cp .env.example .env.local
bun run dev
curl -i http://localhost:3000/api/v1/health
```

## If Broken, Check This
- `NEXT_PUBLIC_SUPABASE_URL` is correct and includes `https://`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set for browser RPC access.
- `SUPABASE_SERVICE_ROLE_KEY` is set only on server environments.
- Vercel Preview and Production have separate env vars configured.
