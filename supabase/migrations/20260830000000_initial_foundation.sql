-- Teoycodex MVP foundation. Domain-specific workflow tables intentionally
-- remain out of scope until the product domain in PRD.md is confirmed.

create extension if not exists pgcrypto;
create schema if not exists private;

create type public.app_role as enum ('admin', 'user');
create type public.account_status as enum ('active', 'disabled', 'pending_deletion');
create type public.audit_result as enum ('success', 'failure', 'denied');
create type public.notification_channel as enum ('in_app', 'email');
create type public.notification_status as enum ('queued', 'sent', 'delivered', 'failed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 120),
  status public.account_status not null default 'active',
  locale text not null default 'th-TH',
  timezone text not null default 'Asia/Bangkok',
  last_seen_at timestamptz,
  deactivated_at timestamptz,
  deactivated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_deactivation_consistency check (
    (status = 'disabled' and deactivated_at is not null)
    or (status <> 'disabled' and deactivated_at is null)
  )
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  reason text check (reason is null or char_length(reason) <= 500)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role public.app_role,
  actor_label text,
  action text not null check (action ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  resource_type text,
  resource_id text,
  result public.audit_result not null,
  old_values jsonb check (old_values is null or jsonb_typeof(old_values) = 'object'),
  new_values jsonb check (new_values is null or jsonb_typeof(new_values) = 'object'),
  request_id uuid,
  ip_address inet,
  user_agent text check (user_agent is null or char_length(user_agent) <= 1000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object')
);

create table public.system_settings (
  key text primary key check (key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'),
  value jsonb not null,
  description text,
  is_public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null check (event_name ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  channel public.notification_channel not null,
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  action_url text check (action_url is null or action_url ~ '^/[^/].*|^/$'),
  status public.notification_status not null default 'queued',
  idempotency_key text not null unique,
  provider_message_id text,
  attempt_count smallint not null default 0 check (attempt_count >= 0),
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  failure_code text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null check (event_name ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  channel public.notification_channel not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, event_name, channel)
);

create table public.product_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id uuid,
  session_id uuid,
  event_name text not null check (event_name ~ '^[a-z][a-z0-9_]*(_[a-z0-9]+)*$'),
  properties jsonb not null default '{}'::jsonb check (jsonb_typeof(properties) = 'object'),
  request_id uuid,
  schema_version smallint not null default 1 check (schema_version > 0),
  constraint product_events_actor_present check (user_id is not null or anonymous_id is not null)
);

create index profiles_inactive_idx on public.profiles(status) where status <> 'active';
create index audit_logs_occurred_at_idx on public.audit_logs(occurred_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_user_id, occurred_at desc) where actor_user_id is not null;
create index audit_logs_resource_idx on public.audit_logs(resource_type, resource_id, occurred_at desc) where resource_id is not null;
create index audit_logs_action_idx on public.audit_logs(action, occurred_at desc);
create index audit_logs_problem_idx on public.audit_logs(result, occurred_at desc) where result in ('failure', 'denied');
create index notifications_recipient_idx on public.notifications(recipient_user_id, created_at desc);
create index notifications_unread_idx on public.notifications(recipient_user_id, created_at desc)
  where channel = 'in_app' and read_at is null;
create index notifications_delivery_idx on public.notifications(status, scheduled_at)
  where status in ('queued', 'failed');
create index product_events_name_idx on public.product_events(event_name, occurred_at desc);
create index product_events_user_idx on public.product_events(user_id, occurred_at desc) where user_id is not null;
create index product_events_anonymous_idx on public.product_events(anonymous_id, occurred_at desc) where anonymous_id is not null;

create function private.is_active_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and status = 'active'
  );
$$;

create function private.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles roles
    join public.profiles profiles on profiles.id = roles.user_id
    where roles.user_id = p_user_id
      and roles.role = 'admin'
      and profiles.status = 'active'
  );
$$;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger settings_set_updated_at
before update on public.system_settings
for each row execute function private.set_updated_at();

create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row execute function private.set_updated_at();

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''));

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

-- Backfill accounts that existed before this migration was applied.
insert into public.profiles (id, display_name)
select id, nullif(trim(raw_user_meta_data ->> 'display_name'), '')
from auth.users
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'user'::public.app_role
from auth.users
on conflict (user_id) do nothing;

create function private.prevent_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_logs are append-only' using errcode = '42501';
end;
$$;

create trigger audit_logs_append_only
before update or delete on public.audit_logs
for each row execute function private.prevent_audit_mutation();

create function public.admin_set_user_role(
  p_target_user_id uuid,
  p_new_role public.app_role,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  old_role public.app_role;
begin
  if not private.is_admin(actor_id) then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  if p_reason is not null and char_length(p_reason) > 500 then
    raise exception 'reason is too long' using errcode = '22001';
  end if;

  select role into old_role
  from public.user_roles
  where user_id = p_target_user_id
  for update;

  if old_role is null then
    raise exception 'target user does not exist' using errcode = 'P0002';
  end if;

  if old_role = 'admin' and p_new_role <> 'admin' and not exists (
    select 1
    from public.user_roles roles
    join public.profiles profiles on profiles.id = roles.user_id
    where roles.role = 'admin'
      and roles.user_id <> p_target_user_id
      and profiles.status = 'active'
  ) then
    raise exception 'cannot remove the last active admin' using errcode = '23514';
  end if;

  if old_role = p_new_role then return; end if;

  update public.user_roles
  set role = p_new_role, granted_by = actor_id, granted_at = now(), reason = p_reason
  where user_id = p_target_user_id;

  select role into actor_role from public.user_roles where user_id = actor_id;
  insert into public.audit_logs (
    actor_user_id, actor_role, action, resource_type, resource_id,
    result, old_values, new_values, metadata
  ) values (
    actor_id, actor_role, 'user.role_changed', 'user', p_target_user_id::text,
    'success', jsonb_build_object('role', old_role),
    jsonb_build_object('role', p_new_role), jsonb_build_object('reason', p_reason)
  );
end;
$$;

create function public.admin_set_account_status(
  p_target_user_id uuid,
  p_new_status public.account_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  old_status public.account_status;
  target_role public.app_role;
begin
  if not private.is_admin(actor_id) then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  if p_reason is not null and char_length(p_reason) > 500 then
    raise exception 'reason is too long' using errcode = '22001';
  end if;

  select profiles.status, roles.role into old_status, target_role
  from public.profiles profiles
  join public.user_roles roles on roles.user_id = profiles.id
  where profiles.id = p_target_user_id
  for update of profiles;

  if old_status is null then
    raise exception 'target user does not exist' using errcode = 'P0002';
  end if;

  if target_role = 'admin' and old_status = 'active' and p_new_status <> 'active' and not exists (
    select 1
    from public.user_roles roles
    join public.profiles profiles on profiles.id = roles.user_id
    where roles.role = 'admin'
      and roles.user_id <> p_target_user_id
      and profiles.status = 'active'
  ) then
    raise exception 'cannot disable the last active admin' using errcode = '23514';
  end if;

  if old_status = p_new_status then return; end if;

  update public.profiles
  set status = p_new_status,
      deactivated_at = case when p_new_status = 'disabled' then now() else null end,
      deactivated_by = case when p_new_status = 'disabled' then actor_id else null end
  where id = p_target_user_id;

  select role into actor_role from public.user_roles where user_id = actor_id;
  insert into public.audit_logs (
    actor_user_id, actor_role, action, resource_type, resource_id,
    result, old_values, new_values, metadata
  ) values (
    actor_id, actor_role,
    case
      when p_new_status = 'active' then 'user.enabled'
      when p_new_status = 'pending_deletion' then 'user.deletion_requested'
      else 'user.disabled'
    end,
    'user', p_target_user_id::text, 'success',
    jsonb_build_object('status', old_status), jsonb_build_object('status', p_new_status),
    jsonb_build_object('reason', p_reason)
  );
end;
$$;

create function public.admin_update_setting(setting_key text, setting_value jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  old_value jsonb;
begin
  if not private.is_admin(actor_id) then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  select value into old_value
  from public.system_settings
  where key = setting_key
  for update;

  if old_value is null then
    raise exception 'setting is not registered' using errcode = 'P0002';
  end if;

  if (setting_key = 'auth.allow_signup' and jsonb_typeof(setting_value) <> 'boolean')
    or (setting_key in ('app.default_locale', 'app.default_timezone') and jsonb_typeof(setting_value) <> 'string') then
    raise exception 'invalid setting value type' using errcode = '22023';
  end if;

  update public.system_settings
  set value = setting_value, updated_by = actor_id
  where key = setting_key;

  select role into actor_role from public.user_roles where user_id = actor_id;
  insert into public.audit_logs (
    actor_user_id, actor_role, action, resource_type, resource_id,
    result, old_values, new_values
  ) values (
    actor_id, actor_role, 'setting.updated', 'system_setting', setting_key,
    'success', jsonb_build_object('value', old_value), jsonb_build_object('value', setting_value)
  );
end;
$$;

create function public.mark_notification_read(notification_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = notification_id
    and recipient_user_id = auth.uid()
    and private.is_active_user();
$$;

insert into public.system_settings (key, value, description, is_public) values
  ('auth.allow_signup', 'false'::jsonb, 'Allow self-service account registration', false),
  ('app.default_locale', '"th-TH"'::jsonb, 'Default application locale', true),
  ('app.default_timezone', '"Asia/Bangkok"'::jsonb, 'Default IANA timezone', true);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.product_events enable row level security;

revoke all on table public.profiles, public.user_roles, public.audit_logs,
  public.system_settings, public.notifications, public.notification_preferences,
  public.product_events from anon, authenticated;

grant select on public.profiles, public.user_roles, public.audit_logs,
  public.system_settings, public.notifications, public.notification_preferences to authenticated;
grant insert, update, delete on public.notification_preferences to authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_active_user(uuid), private.is_admin(uuid) to authenticated;
revoke execute on all functions in schema private from public, anon;

revoke execute on function public.admin_set_user_role(uuid, public.app_role, text),
  public.admin_set_account_status(uuid, public.account_status, text),
  public.admin_update_setting(text, jsonb), public.mark_notification_read(uuid) from public, anon;
grant execute on function public.admin_set_user_role(uuid, public.app_role, text),
  public.admin_set_account_status(uuid, public.account_status, text),
  public.admin_update_setting(text, jsonb), public.mark_notification_read(uuid) to authenticated;

create policy profiles_select_self_or_admin on public.profiles
for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create policy user_roles_select_self_or_admin on public.user_roles
for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy audit_logs_select_admin on public.audit_logs
for select to authenticated
using ((select private.is_admin()));

create policy settings_select_visible on public.system_settings
for select to authenticated
using (
  (select private.is_active_user())
  and (is_public or (select private.is_admin()))
);

create policy notifications_select_own on public.notifications
for select to authenticated
using (
  recipient_user_id = (select auth.uid())
  and (select private.is_active_user())
);

create policy notifications_update_own on public.notifications
for update to authenticated
using (
  recipient_user_id = (select auth.uid())
  and (select private.is_active_user())
)
with check (
  recipient_user_id = (select auth.uid())
  and (select private.is_active_user())
);

create policy notification_preferences_select_own on public.notification_preferences
for select to authenticated
using (user_id = (select auth.uid()) and (select private.is_active_user()));

create policy notification_preferences_insert_own on public.notification_preferences
for insert to authenticated
with check (user_id = (select auth.uid()) and (select private.is_active_user()));

create policy notification_preferences_update_own on public.notification_preferences
for update to authenticated
using (user_id = (select auth.uid()) and (select private.is_active_user()))
with check (user_id = (select auth.uid()) and (select private.is_active_user()));

create policy notification_preferences_delete_own on public.notification_preferences
for delete to authenticated
using (user_id = (select auth.uid()) and (select private.is_active_user()));

comment on table public.product_events is
  'Server-ingested analytics only. No direct anon/authenticated grants.';
comment on table public.audit_logs is
  'Append-only security and administrative audit ledger.';
