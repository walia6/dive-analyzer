create extension if not exists pgcrypto;

create table if not exists public.saved_dives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 160),
  notes text not null default '' check (char_length(notes) <= 10000),
  source_filename text not null,
  source_xml text not null,
  summary jsonb not null default '{}'::jsonb
);

create index if not exists saved_dives_user_created_idx on public.saved_dives(user_id, created_at desc);
alter table public.saved_dives enable row level security;
drop policy if exists "Owners can select their dives" on public.saved_dives;
create policy "Owners can select their dives" on public.saved_dives for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Owners can insert their dives" on public.saved_dives;
create policy "Owners can insert their dives" on public.saved_dives for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Owners can update their dives" on public.saved_dives;
create policy "Owners can update their dives" on public.saved_dives for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Owners can delete their dives" on public.saved_dives;
create policy "Owners can delete their dives" on public.saved_dives for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists saved_dives_updated_at on public.saved_dives;
create trigger saved_dives_updated_at before update on public.saved_dives for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.saved_dives to authenticated;
revoke all on public.saved_dives from anon;
