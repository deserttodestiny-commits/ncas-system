-- Only explicit membership dues may extend a member's paid-through fiscal year.
-- Donations and other income can still be associated with a member without renewal.

begin;

alter table public.ncas_system_income
  add constraint ncas_system_membership_renewal_requires_member
  check (
    category <> 'सदस्यता शुल्क/नवीकरण'
    or (member_id is not null and fiscal_year is not null)
  );

create or replace function ncas_system_private.renew_membership_from_income()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.category = 'सदस्यता शुल्क/नवीकरण' then
    update public.ncas_system_members
    set paid_through_fiscal_year = greatest(coalesce(paid_through_fiscal_year, 0), new.fiscal_year),
        updated_at = now()
    where id = new.member_id;
  end if;
  return new;
end;
$$;

commit;
