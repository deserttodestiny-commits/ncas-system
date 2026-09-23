# NCAS System database setup

This folder is a draft for a **new, dedicated** Supabase project named
`ncas-system`. It must not be applied to the existing `ncas-website` project.
No sample people, payments, or credentials are included.

## Before applying

1. Create the project in the NCAS Supabase account. The account owner must
   choose and enter the database password personally; do not send it in chat or
   commit it to Git.
2. Keep the `ncas-website` project and its users/data separate. In the new
   project's creation form, disable **Automatically expose new tables**.
3. Review and test the migration on the empty project before entering real data.
   The migration enables RLS, revokes default client access, and grants only
   authenticated, policy-limited access. No `anon` data access is intended.

## Roles and initial access

`app_admins` is not client-readable or client-writable. After an admin account
is created through Supabase Auth, a trusted project owner can bootstrap it in
the SQL Editor using its actual `auth.users.id`:

```sql
insert into public.app_admins (user_id)
values ('REPLACE_WITH_AUTH_USER_UUID');
```

Do not paste a password or service-role/secret key into this repository. Do not
grant admin by user-editable metadata. A member account is linked by setting
`members.auth_user_id` to its Auth user ID; membership number and phone alone
are not authentication.

## Permission model

- Admin: read/add/edit members; read/add income, expenses, notifications, and
  opportunities.
- Member: read only their own member row and related income; read applicable
  district notifications and opportunities.
- Signed-out visitor: no access to any of these tables.
- No browser update/delete access to financial rows. Corrections require an
  audited reversal workflow that is not built yet.

The `public.current_app_role()` function is for UI navigation; database RLS is
the actual enforcement. Photo storage, audited finance corrections, access
tests, and frontend integration are still required before production use.
