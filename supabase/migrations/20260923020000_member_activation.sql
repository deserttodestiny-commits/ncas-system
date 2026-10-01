-- One-time, admin-issued member activation codes. No code or phone number is
-- stored as an Auth password. The member chooses a password during activation.
begin;

create table public.ncas_system_member_activations (
  member_id uuid primary key references public.ncas_system_members(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  consumed_at timestamptz,
  issued_at timestamptz not null default now(),
  issued_by uuid not null references auth.users(id)
);

alter table public.ncas_system_member_activations enable row level security;
revoke all on public.ncas_system_member_activations from anon, authenticated;
grant select, insert, update on public.ncas_system_member_activations to service_role;
-- Existing System tables intentionally revoked browser roles; explicitly grant
-- the Edge Function's server role only the columns/actions it needs.
grant select on public.ncas_system_admins to service_role;
grant select (id, membership_id, phone, auth_user_id), update (auth_user_id)
on public.ncas_system_members to service_role;

-- Called only with the Edge Function's service-role client. The update locks
-- the row, limits guesses to five, and consumes a correct code exactly once.
create or replace function public.ncas_system_consume_member_activation(
  p_member_id uuid,
  p_code_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched boolean;
begin
  update public.ncas_system_member_activations
  set attempts = attempts + 1,
      consumed_at = case when code_hash = p_code_hash then now() else consumed_at end
  where member_id = p_member_id
    and consumed_at is null
    and expires_at > now()
    and attempts < 5
  returning code_hash = p_code_hash into matched;

  return coalesce(matched, false);
end;
$$;

revoke execute on function public.ncas_system_consume_member_activation(uuid, text)
from public, anon, authenticated;
grant execute on function public.ncas_system_consume_member_activation(uuid, text)
to service_role;

-- Keep the visible login ID stable after an account has been activated.
create or replace function ncas_system_private.prevent_linked_membership_id_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.auth_user_id is not null and new.membership_id is distinct from old.membership_id then
    raise exception 'Activated membership ID cannot be changed';
  end if;
  return new;
end;
$$;

create trigger ncas_system_members_lock_activated_id
before update on public.ncas_system_members
for each row execute function ncas_system_private.prevent_linked_membership_id_change();

commit;
