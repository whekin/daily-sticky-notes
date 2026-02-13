create extension if not exists pgcrypto;

create table if not exists public.gift_settings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  start_date date not null,
  unlock_hour integer not null default 7 check (unlock_hour between 0 and 23),
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.gift_notes (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gift_settings(id) on delete cascade,
  day_index integer not null check (day_index between 1 and 30),
  body text not null,
  image_url text,
  created_at timestamptz not null default now(),
  unique (gift_id, day_index)
);

create table if not exists public.gift_events (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid references public.gift_settings(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.gift_settings enable row level security;
alter table public.gift_notes enable row level security;
alter table public.gift_events enable row level security;

revoke all on public.gift_settings from anon, authenticated;
revoke all on public.gift_notes from anon, authenticated;
revoke all on public.gift_events from anon, authenticated;

create policy gift_events_insert_opened
on public.gift_events
for insert
to anon, authenticated
with check (event_type = 'opened');

create or replace function public.rpc_get_unlock_context(p_slug text, p_tz text)
returns table (
  day_index integer,
  unlocked_count integer,
  total_count integer,
  is_complete boolean,
  unlock_hour integer,
  start_date date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_tz text := 'UTC';
  local_now timestamp;
  local_date date;
  local_hour integer;
begin
  if exists (select 1 from pg_timezone_names where name = p_tz) then
    resolved_tz := p_tz;
  end if;

  local_now := now() at time zone resolved_tz;
  local_date := local_now::date;
  local_hour := extract(hour from local_now);

  return query
    with settings as (
      select gs.start_date, gs.unlock_hour
      from public.gift_settings gs
      where gs.slug = p_slug
      limit 1
    ),
    calc as (
      select
        ((local_date - settings.start_date) + 1 - case when local_hour < settings.unlock_hour then 1 else 0 end) as raw_index,
        settings.unlock_hour as unlock_hour,
        settings.start_date as start_date
      from settings
    )
    select
      greatest(least(calc.raw_index, 30), 1)::integer as day_index,
      greatest(least(calc.raw_index, 30), 0)::integer as unlocked_count,
      30::integer as total_count,
      (greatest(least(calc.raw_index, 30), 0) >= 30) as is_complete,
      calc.unlock_hour,
      calc.start_date
    from calc;
end;
$$;

create or replace function public.rpc_get_unlocked_notes(p_slug text, p_tz text)
returns table (
  id uuid,
  day_index integer,
  body text,
  image_url text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with context as (
    select * from public.rpc_get_unlock_context(p_slug, p_tz)
  )
  select
    gn.id,
    gn.day_index,
    gn.body,
    gn.image_url,
    gn.created_at
  from public.gift_notes gn
  join public.gift_settings gs on gs.id = gn.gift_id
  join context on true
  where gs.slug = p_slug
    and gn.day_index <= context.unlocked_count
  order by gn.day_index desc;
$$;

create or replace function public.rpc_get_today_note(p_slug text, p_tz text)
returns table (
  id uuid,
  day_index integer,
  body text,
  image_url text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with context as (
    select * from public.rpc_get_unlock_context(p_slug, p_tz)
  )
  select
    gn.id,
    gn.day_index,
    gn.body,
    gn.image_url,
    gn.created_at
  from public.gift_notes gn
  join public.gift_settings gs on gs.id = gn.gift_id
  join context on true
  where gs.slug = p_slug
    and gn.day_index <= context.unlocked_count
  order by gn.day_index desc
  limit 1;
$$;

revoke all on function public.rpc_get_unlock_context(text, text) from public;
revoke all on function public.rpc_get_unlocked_notes(text, text) from public;
revoke all on function public.rpc_get_today_note(text, text) from public;

grant execute on function public.rpc_get_unlock_context(text, text) to anon, authenticated;
grant execute on function public.rpc_get_unlocked_notes(text, text) to anon, authenticated;
grant execute on function public.rpc_get_today_note(text, text) to anon, authenticated;
