-- Keep payment and membership renewal in one database transaction.
-- The trigger runs only after an admin-authorized income INSERT passes RLS.

begin;

create or replace function ncas_system_private.renew_membership_from_income()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.member_id is not null and new.fiscal_year is not null then
    update public.ncas_system_members
    set paid_through_fiscal_year = greatest(coalesce(paid_through_fiscal_year, 0), new.fiscal_year),
        updated_at = now()
    where id = new.member_id;
  end if;
  return new;
end;
$$;

revoke execute on function ncas_system_private.renew_membership_from_income() from public, anon, authenticated;

create trigger ncas_system_income_renews_member
after insert on public.ncas_system_income
for each row execute function ncas_system_private.renew_membership_from_income();

commit;
