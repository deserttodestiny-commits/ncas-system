# NCAS System database setup

This folder is a draft for the existing `ncas-website` Supabase project. The
Free plan has reached its two-project limit, and the user chose to share this
NCAS-owned backend. All new tables/functions use `ncas_system_` names; no
existing website table is renamed or modified. No sample people, payments, or
credentials are included.

## Before applying

1. Review and test the migration against the existing `ncas-website` project
   before entering real member or financial data. Take a backup first because
   the project already holds NCAS website content.
2. Do not apply this SQL to `supabase-charcoal-horizon`; it already contains
   another application's client, billing, and stock tables.
3. Apply the migration only after a review of its access changes.
   The migration enables RLS, revokes default client access, and grants only
   authenticated, policy-limited access. No `anon` data access is intended.

## Roles and initial access

`ncas_system_admins` is not client-readable or client-writable. After an admin account
is created through Supabase Auth, a trusted project owner can bootstrap it in
the SQL Editor using its actual `auth.users.id`:

```sql
insert into public.ncas_system_admins (user_id)
values ('REPLACE_WITH_AUTH_USER_UUID');
```

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
the actual enforcement. Photo storage, audited finance corrections, access
tests, and frontend integration are still required before production use.
