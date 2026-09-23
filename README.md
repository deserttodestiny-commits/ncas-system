# NCAS System

Member management, finance records, and a member portal for Nepal Commercial Artist Sangh.

## Deployment status

The app is designed for Vercel, with authentication and records in the NCAS-owned
`ncas-website` Supabase project. System data lives only in prefixed `ncas_system_*`
tables; no example member or finance rows were inserted. Previous browser-local demo
records were removed, and production has no demo login. The website and System use
separate admin permissions even though they share a Supabase project.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel for Production,
Preview, and Development. These are browser-safe values, **never** a service-role key.
Copy `.env.example` to `.env.local` to run locally. Run `npm install`, `npm run dev`,
`npm run build`, and `npm run lint`.

The first System admin is `ncasnepal@gmail.com`, linked by Auth user ID in
`ncas_system_admins`. The owner must use that account's existing Supabase password;
there is no password in this repository. A member needs a Supabase Auth account
explicitly linked to their member row. Adding a member record alone does not create
login access.

## Important limits before real-data use

- Authenticated end-to-end write testing with a real admin is pending; do not enter
  sensitive production records until that check.
- Membership invites/linking, audited finance corrections, backups, and private
  photo storage need a follow-up release. Browser delete of finance rows is disabled.
- Online payment, SMS, and payment notifications are not active. Do not treat the
  finance form as a payment gateway.
- Access relies on Supabase RLS, not frontend route guards. See [supabase/](supabase/README.md).
