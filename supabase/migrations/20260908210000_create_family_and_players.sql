create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  avatar_key text,
  birth_year smallint,
  preferred_foot text check (preferred_foot is null or preferred_foot in ('left', 'right', 'both')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists players_family_id_idx on public.players(family_id);
create index if not exists players_family_active_idx on public.players(family_id) where archived_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.bootstrap_family_for_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.families (owner_user_id)
  values (new.id)
  on conflict (owner_user_id) do nothing;
  return new;
end;
$$;

create or replace function public.derive_player_family_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_family_id uuid;
begin
  if auth.uid() is not null then
    select id into v_family_id
    from public.families
    where owner_user_id = auth.uid();

    if v_family_id is null then
      raise exception 'No family exists for authenticated user';
    end if;

    new.family_id = v_family_id;
  end if;
  return new;
end;
$$;

drop trigger if exists families_set_updated_at on public.families;
create trigger families_set_updated_at before update on public.families
for each row execute function public.set_updated_at();

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at before update on public.players
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created_create_family on auth.users;
create trigger on_auth_user_created_create_family after insert on auth.users
for each row execute function public.bootstrap_family_for_user();

drop trigger if exists players_derive_family on public.players;
create trigger players_derive_family before insert on public.players
for each row execute function public.derive_player_family_from_auth();

insert into public.families (owner_user_id)
select id from auth.users
on conflict (owner_user_id) do nothing;

alter table public.families enable row level security;
alter table public.players enable row level security;

drop policy if exists families_select_own on public.families;
create policy families_select_own on public.families for select to authenticated
using (owner_user_id = auth.uid());

drop policy if exists families_update_own on public.families;
create policy families_update_own on public.families for update to authenticated
using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists players_select_own_family on public.players;
create policy players_select_own_family on public.players for select to authenticated
using (exists (select 1 from public.families f where f.id = players.family_id and f.owner_user_id = auth.uid()));

drop policy if exists players_insert_own_family on public.players;
create policy players_insert_own_family on public.players for insert to authenticated
with check (exists (select 1 from public.families f where f.id = players.family_id and f.owner_user_id = auth.uid()));

drop policy if exists players_update_own_family on public.players;
create policy players_update_own_family on public.players for update to authenticated
using (exists (select 1 from public.families f where f.id = players.family_id and f.owner_user_id = auth.uid()))
with check (exists (select 1 from public.families f where f.id = players.family_id and f.owner_user_id = auth.uid()));

drop policy if exists players_delete_own_family on public.players;
create policy players_delete_own_family on public.players for delete to authenticated
using (exists (select 1 from public.families f where f.id = players.family_id and f.owner_user_id = auth.uid()));

revoke all on public.families from anon;
revoke all on public.players from anon;
grant select, update on public.families to authenticated;
grant select, insert, update, delete on public.players to authenticated;

revoke execute on function public.bootstrap_family_for_user() from public, anon, authenticated;
revoke execute on function public.derive_player_family_from_auth() from public, anon, authenticated;
