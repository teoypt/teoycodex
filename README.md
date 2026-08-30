# Teoycodex

Admin foundation built with Next.js 16 App Router, TypeScript, Tailwind CSS, and Supabase SSR.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Connect Supabase

Supabase environment variables are required. The app fails explicitly when they are missing instead of substituting local data.

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project Connect/API panel.
4. Apply `supabase/migrations/20260830000000_initial_foundation.sql` with the Supabase SQL Editor or Supabase CLI.
5. Create the first Auth user with the Supabase Dashboard. Bootstrap that account to `admin` once in the SQL Editor, then use the audited Admin RPC for future role changes:

```sql
do $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = 'admin@example.com';
  if target_id is null then raise exception 'Admin user not found'; end if;

  update public.user_roles
  set role = 'admin', granted_at = now(), reason = 'initial bootstrap'
  where user_id = target_id;

  insert into public.audit_logs (
    actor_user_id, actor_role, action, resource_type, resource_id, result, metadata
  ) values (
    null, null, 'system.bootstrap_admin', 'user', target_id::text, 'success',
    jsonb_build_object('source', 'supabase_sql_editor')
  );
end $$;
```

The current page performs a verified server-side user lookup, reads the caller's role, and loads the latest `audit_logs` only when RLS confirms the user is an active Admin. Cookie refresh is handled by the Next.js 16 `proxy.ts` boundary.

`SUPABASE_SERVICE_ROLE_KEY` is optional and unused in the current integration. Keep it server-only if a later account-creation endpoint needs it.

## User management

- `/login` signs in with an existing Supabase Auth email/password account.
- `/admin/users` is available only to an active `admin`.
- Admins can search/filter profiles, change `admin`/`user` roles, and activate/disable accounts.
- Role and status mutations call the audited Postgres RPC functions. UI checks are not treated as authorization.
- The current screen intentionally prevents changing your own role/status and the database prevents removing or disabling the last active Admin.
- Creating/inviting Auth users is not exposed yet because it requires a server-only service-role key and a confirmed invite/auth method. Create the account in Supabase Auth Dashboard for now; its profile and default `user` role are created by the database trigger.

## Current scope

- Admin landing/home page only
- Responsive desktop and mobile UI
- Live access events loaded from Supabase
- Server and browser Supabase clients with cookie-based SSR auth
- Admin/User role checks backed by RLS
- Initial schema migration for profiles, roles, audit, settings, notifications, and analytics

The product domain, core workflow, authentication method, and notification provider remain intentionally undecided.
