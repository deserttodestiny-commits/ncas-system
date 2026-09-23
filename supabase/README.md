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

## Member ID login

`20260923020000_member_activation.sql` adds admin-issued, single-use activation
codes. It and the `ncas-member-admin` and `ncas-member-access` Edge Functions
were applied to the same `ncas-website` project on 2026-09-23.
The first function requires a signed-in System admin and returns a fresh code
once; it invalidates an earlier code. The second verifies the member ID,
registered phone number, and code before creating or resetting a member Auth
account. It uses the project's server-provided secret key inside Supabase only;
the browser never receives that key. Codes expire in seven days or after five
incorrect guesses. The member then chooses a new password (minimum 12
characters). A phone number is only an identity check during activation; it is
never saved as a permanent Auth password. Subsequent login uses member ID and
the chosen password, not email.

The public `ncas-member-access` function uses `auth: 'publishable'`; its
`verify_jwt = false` setting is required to admit a signed-out first-time
member. The wrapper still checks the publishable API key. The
`ncas-member-admin` function keeps JWT verification on and checks
`ncas_system_admins` before issuing a code. Never make its admin action
accessible based only on a client-supplied role. Do not deploy the frontend
until both functions and the migration are working. Invalid member IDs were
verified to return a generic 400 response; no production member account was
created for testing.
