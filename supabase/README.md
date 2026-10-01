# NCAS System database setup

The migrations in this folder were applied to the existing NCAS-owned
`ncas-website` Supabase project (`kxnjilquajxcqhujzghn`). Do not
run them against `supabase-charcoal-horizon` or any other project. No demo rows
were added; all System tables use the `ncas_system_*` prefix.

`20260923000000_initial_schema.sql` creates access-controlled tables and the role
RPC. `20260923010000_membership_renewal.sql` originally updated a member's
paid-through fiscal year for linked income. The 2026-09-30 migration
`20260930000000_membership_renewal_category.sql` restricts that update to the
explicit `सदस्यता शुल्क/नवीकरण` category, so donations and other income cannot
renew membership. It also requires a member and fiscal year for that category.
The migration was applied and verified on 2026-09-30 with zero income rows.

## Roles and initial access

`ncas_system_admins` is not client-readable or client-writable.
`ncasnepal@gmail.com` was granted System admin access by matching its existing
Supabase Auth user ID.

Do not paste a password or service-role/secret key into this repository. Do not
grant admin by user-editable metadata. A member account is linked by setting
`ncas_system_members.auth_user_id` to its Auth user ID. The requested initial
credential is membership ID plus registered phone number; this is weaker than a
private password because both values may be known to others.

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

The earlier `20260923020000_member_activation.sql` migration created a code
table and protected the member ID after linking. The code table remains for
compatibility but is not used by this login flow. The `ncas-member-access` Edge
Function looks up a member by ID. On the first login attempt it creates a
Supabase Auth account with the registered ten-digit phone as its initial
password and links its Auth user ID to the member row. Password verification
then runs through Supabase Auth. Later logins use the same member ID and the
current password, which may have been changed in Profile → Settings. This
function never returns the phone number to the browser.

The public `ncas-member-access` function uses `auth: 'publishable'`; its
`verify_jwt = false` setting is required to admit a signed-out first-time
member. The wrapper still checks the publishable API key. The
`ncas-member-admin` function keeps JWT verification on and checks
`ncas_system_admins` before resetting a member password to the registered
phone number. Never make its admin action accessible based only on a
client-supplied role. Do not deploy the frontend until both functions are
working. Test with a disposable member before inviting real members.

## SMS status

Automatic SMS is not part of the initial-password or reset flow. The previous
AakashSMS diagnostic remains in the admin Edge Function, but the Member screen
does not invoke it for login. An admin reset returns only the final four digits
of the registered phone; no SMS is sent. Do not put `AAKASH_SMS_TOKEN` in Vercel,
the browser, Git, or support messages.
