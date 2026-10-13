-- Audited corrections for financial records. An admin may correct a mistaken
-- income row only through the RPC below; the original and replacement values
-- plus the reason remain permanently available for audit.

begin;

create table public.ncas_system_income_corrections (
  id uuid primary key default gen_random_uuid(),
  income_id uuid not null references public.ncas_system_income(id) on delete restrict,
  reason text not null check (char_length(btrim(reason)) >= 3),
  before_data jsonb not null,
  after_data jsonb not null,
  corrected_by uuid not null references auth.users(id) on delete restrict,
  corrected_at timestamptz not null default now()
);

create index ncas_system_income_corrections_income_id_idx
  on public.ncas_system_income_corrections(income_id, corrected_at desc);

alter table public.ncas_system_income_corrections enable row level security;
revoke all on table public.ncas_system_income_corrections from anon, authenticated;
grant select on table public.ncas_system_income_corrections to authenticated;

create policy "admins read income corrections"
on public.ncas_system_income_corrections for select to authenticated
using ((select ncas_system_private.is_admin()));

create or replace function ncas_system_private.refresh_member_paid_through(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_paid_through integer;
begin
  if p_member_id is null then return; end if;

  select max(fiscal_year) into v_paid_through
  from public.ncas_system_income
  where member_id = p_member_id
    and category = 'सदस्यता शुल्क/नवीकरण';

  update public.ncas_system_members
  set paid_through_fiscal_year = v_paid_through,
      updated_at = now()
  where id = p_member_id;
end;
$$;

revoke execute on function ncas_system_private.refresh_member_paid_through(uuid) from public, anon, authenticated;

create or replace function public.ncas_system_correct_income(
  p_income_id uuid,
  p_date date,
  p_category text,
  p_amount numeric,
  p_description text,
  p_received_from text,
  p_member_id uuid,
  p_fiscal_year integer,
  p_bs_key text,
  p_reason text
)
returns public.ncas_system_income
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before public.ncas_system_income;
  v_after public.ncas_system_income;
begin
  if not (select ncas_system_private.is_admin()) then
    raise exception 'Only NCAS System administrators can correct income records';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A correction reason is required';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Income amount must be greater than zero';
  end if;
  if p_category = 'सदस्यता शुल्क/नवीकरण' and (p_member_id is null or p_fiscal_year is null) then
    raise exception 'Membership renewal requires a member and fiscal year';
  end if;

  select * into v_before
  from public.ncas_system_income
  where id = p_income_id
  for update;

  if not found then
    raise exception 'Income record not found';
  end if;

  update public.ncas_system_income
  set date = p_date,
      category = p_category,
      amount = p_amount,
      description = nullif(btrim(coalesce(p_description, '')), ''),
      received_from = nullif(btrim(coalesce(p_received_from, '')), ''),
      member_id = p_member_id,
      fiscal_year = p_fiscal_year,
      bs_key = nullif(btrim(coalesce(p_bs_key, '')), '')
  where id = p_income_id
  returning * into v_after;

  insert into public.ncas_system_income_corrections (
    income_id, reason, before_data, after_data, corrected_by
  ) values (
    p_income_id,
    btrim(p_reason),
    to_jsonb(v_before),
    to_jsonb(v_after),
    (select auth.uid())
  );

  perform ncas_system_private.refresh_member_paid_through(v_before.member_id);
  if p_member_id is distinct from v_before.member_id then
    perform ncas_system_private.refresh_member_paid_through(p_member_id);
  end if;

  return v_after;
end;
$$;

revoke execute on function public.ncas_system_correct_income(uuid, date, text, numeric, text, text, uuid, integer, text, text) from public, anon;
grant execute on function public.ncas_system_correct_income(uuid, date, text, numeric, text, text, uuid, integer, text, text) to authenticated;

commit;
