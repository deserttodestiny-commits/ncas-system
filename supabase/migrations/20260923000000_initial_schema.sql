-- NCAS System: empty production schema. No demo rows are inserted.
-- Apply only to a dedicated NCAS System Supabase project, not ncas-website.

create schema if not exists private;

create table public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  membership_id text unique not null,
  full_name text not null,
  gender text,
  dob date,
  citizenship_no text,
  phone text not null,
  email text,
  district text,
  municipality text,
  ward_no text,
  art_fields text[] not null default '{}',
  experience_years integer check (experience_years >= 0),
  employment_status text,
  organization_name text,
  membership_type text,
  join_date date not null,
  paid_through_fiscal_year integer,
  monthly_fee numeric(12,2) not null default 0 check (monthly_fee >= 0),
  notes text,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.income (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  description text,
  received_from text,
  member_id uuid references public.members(id) on delete restrict,
  fiscal_year integer,
  bs_key text,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  description text,
  paid_to text,
  bs_key text,
  created_at timestamptz not null default now()
);

create table public.member_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  target_district text,
  published_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  deadline date,
  contact text,
  created_at timestamptz not null default now()
);

create index members_auth_user_id_idx on public.members(auth_user_id);
create index income_member_id_idx on public.income(member_id);
create index income_date_idx on public.income(date desc);
create index expenses_date_idx on public.expenses(date desc);
create index notifications_target_district_idx on public.member_notifications(target_district);

-- This function is not in an exposed API schema. It can only answer whether
-- the current authenticated user is listed in app_admins; clients cannot
-- grant themselves the role.
create or replace function private.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on schema private from public;
revoke execute on function private.is_app_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_app_admin() to authenticated;

alter table public.app_admins enable row level security;
alter table public.members enable row level security;
alter table public.income enable row level security;
alter table public.expenses enable row level security;
alter table public.member_notifications enable row level security;
alter table public.opportunities enable row level security;

revoke all on table public.app_admins from anon, authenticated;
revoke all on table public.members from anon, authenticated;
revoke all on table public.income from anon, authenticated;
revoke all on table public.expenses from anon, authenticated;
revoke all on table public.member_notifications from anon, authenticated;
revoke all on table public.opportunities from anon, authenticated;

grant select, insert, update on table public.members to authenticated;
grant select, insert on table public.income to authenticated;
grant select, insert on table public.expenses to authenticated;
grant select, insert on table public.member_notifications to authenticated;
grant select, insert on table public.opportunities to authenticated;

create policy "admins or owner read members"
on public.members for select to authenticated
using ((select private.is_app_admin()) or auth_user_id = (select auth.uid()));

create policy "admins add members"
on public.members for insert to authenticated
with check ((select private.is_app_admin()));

create policy "admins edit members"
on public.members for update to authenticated
using ((select private.is_app_admin()))
with check ((select private.is_app_admin()));

create policy "admins or paying member read income"
on public.income for select to authenticated
using (
  (select private.is_app_admin()) or exists (
    select 1 from public.members m
    where m.id = member_id and m.auth_user_id = (select auth.uid())
  )
);

create policy "admins add income"
on public.income for insert to authenticated
with check ((select private.is_app_admin()));

create policy "admins read expenses"
on public.expenses for select to authenticated
using ((select private.is_app_admin()));

create policy "admins add expenses"
on public.expenses for insert to authenticated
with check ((select private.is_app_admin()));

create policy "admins or targeted members read notifications"
on public.member_notifications for select to authenticated
using (
  (select private.is_app_admin()) or exists (
    select 1 from public.members m
    where m.auth_user_id = (select auth.uid())
      and (target_district is null or m.district = target_district)
  )
);

create policy "admins add notifications"
on public.member_notifications for insert to authenticated
with check ((select private.is_app_admin()));

create policy "admins or members read opportunities"
on public.opportunities for select to authenticated
using (
  (select private.is_app_admin()) or exists (
    select 1 from public.members m where m.auth_user_id = (select auth.uid())
  )
);

create policy "admins add opportunities"
on public.opportunities for insert to authenticated
with check ((select private.is_app_admin()));

-- UI routing hint only. RLS above remains the actual authorization boundary.
create or replace function public.current_app_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when (select private.is_app_admin()) then 'admin'
    when exists (
      select 1 from public.members m
      where m.auth_user_id = (select auth.uid())
    ) then 'member'
    else 'none'
  end;
$$;

revoke execute on function public.current_app_role() from public, anon;
grant execute on function public.current_app_role() to authenticated;

-- Finance rows deliberately have no browser update/delete policies. Corrections
-- will use audited reversal entries in a later migration, never silent deletion.
