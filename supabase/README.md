# NCAS System database setup

The migrations in this folder were applied to the existing NCAS-owned
`ncas-website` Supabase project (`kxnjilquajxcqhujzghn`) on 2026-09-23. Do not
run them against `supabase-charcoal-horizon` or any other project. No demo rows
were added; all System tables use the `ncas_system_*` prefix.

`20260923000000_initial_schema.sql` creates access-controlled tables and the role
RPC. `20260923010000_membership_renewal.sql` atomically updates a member's
paid-through fiscal year when an authorized income entry is inserted.

## Roles and initial access

`ncas_system_admins` is not client-readable or client-writable.
`ncasnepal@gmail.com` was granted System admin access by matching its existing
Supabase Auth user ID.

Do not paste a password or service-role/secret key into this repository. Do not
grant admin by user-editable metadata. A member account is linked by setting
`ncas_system_members.auth_user_id` to its Auth user ID; membership number and phone alone
are not authentication.

## Permission model

- Admin: read/add/edit members; read/add income, expenses, notifications, and
  opportunities.
- Member: read only their own member row and related income; read applicable
  district notifications and opportunities.
- Signed-out visitor: no access to any of these tables.
- No browser update/delete access to financial rows. Corrections require an
  audited reversal workflow that is not built yet.

The `public.ncas_system_current_role()` function is for UI navigation; database RLS is
the actual enforcement. Backups, private photo storage, member onboarding, and
authenticated write-path verification remain necessary before real-data use.
