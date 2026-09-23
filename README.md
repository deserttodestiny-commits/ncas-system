# NCAS System

Member management, finance records, and a member portal for Nepal Commercial Artist Sangh.

## Current status

This is a prototype, **not a production system**. The old bundled sample records have been removed. On each browser's first visit after this change, the original `ncas_*` demo data and demo session are cleared once. The production build does not offer the old browser-only admin/member login. Do not enter real member or financial data yet.

Local development still provides a demo mode for testing screens. It uses browser `localStorage`, so records are not shared between devices and are not backed up.

## Next production steps

1. Create a dedicated Supabase backend for NCAS System.
2. Replace demo login with Supabase Auth and server-enforced admin/member permissions.
3. Move members, income, expenses, notifications, and opportunities into protected database tables; add private file storage as needed.
4. Add migration, audit trail, backup, and access-control tests before enabling real users.
5. Configure the Vercel project with the browser-safe Supabase URL and publishable key, then connect the NCAS website's second login to the deployed System app.

An empty, access-controlled database migration is being prepared on the
`codex/secure-ncas-system` branch in [supabase/](supabase/README.md). It has
not been applied or connected to the live app. The Supabase Free plan account
has reached its two-project limit. NCAS System will use prefixed tables in the
existing `ncas-website` project, as requested, without touching the other
application's Supabase project.

Run locally with `npm install` and `npm run dev`. Use `npm run build` and `npm run lint` to check changes.
