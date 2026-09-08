# Supabase setup

Phase 1B-1 uses Supabase for parent authentication and family-owned player profiles.

## Public application environment variables

Set these in local development and in Cloudflare Workers Builds:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

These values are intentionally public browser configuration. Do not expose a service-role key or database password to the application.

If either public variable is absent, Aukaæfing keeps the Phase 1A fixture-player path so the child workout loop remains usable.

## Authentication

The parent setup screen at `/stillingar` uses Supabase passwordless email login. Supabase Auth must allow the deployed application origin and `/auth/callback` as an authentication redirect. Preview and localhost origins used for testing must also be allow-listed.

Children do not receive Supabase accounts or passwords.

## Database

The migration in `supabase/migrations/20260908210000_create_family_and_players.sql` creates:

- one `families` row per authenticated owner,
- family-owned `players`,
- automatic family bootstrap on account creation,
- RLS policies limiting reads and mutations to the authenticated family owner,
- a before-insert trigger that derives `players.family_id` from `auth.uid()`.

The browser never submits an arbitrary `family_id`. Ownership is established in the database.

The production Supabase project was created and this schema was applied manually before the migration was committed to the repository. The migration is written defensively so applying it to that project later is safe.
