-- PurpleDSA database schema for Supabase SQL Editor.
-- Run this once in the Supabase project's SQL Editor.

create table if not exists public."user" (
  "id" text primary key not null,
  "username" text not null,
  "leetcodeUsername" text,
  "name" text,
  "email" text,
  "emailVerified" timestamp,
  "image" text,
  "passwordHash" text,
  "createdAt" timestamp default now() not null,
  constraint "user_username_unique" unique ("username"),
  constraint "user_email_unique" unique ("email")
);

create table if not exists public."account" (
  "userId" text not null,
  "type" text not null,
  "provider" text not null,
  "providerAccountId" text not null,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  constraint "account_provider_providerAccountId_pk"
    primary key ("provider", "providerAccountId"),
  constraint "account_userId_user_id_fk"
    foreign key ("userId") references public."user" ("id")
    on delete cascade
);

create table if not exists public."session" (
  "sessionToken" text primary key not null,
  "userId" text not null,
  "expires" timestamp not null,
  constraint "session_userId_user_id_fk"
    foreign key ("userId") references public."user" ("id")
    on delete cascade
);

create table if not exists public."verificationToken" (
  "identifier" text not null,
  "token" text not null,
  "expires" timestamp not null,
  constraint "verificationToken_identifier_token_pk"
    primary key ("identifier", "token")
);

create table if not exists public."progress" (
  "id" text primary key not null,
  "userId" text not null,
  "setSlug" text not null,
  "problemSlug" text not null,
  "solved" boolean default true not null,
  "solvedAt" timestamp default now() not null,
  constraint "progress_userId_user_id_fk"
    foreign key ("userId") references public."user" ("id")
    on delete cascade
);

create unique index if not exists "progress_user_set_problem_idx"
  on public."progress" ("userId", "setSlug", "problemSlug");

alter table public."user"
  add column if not exists "leetcodeUsername" text;

-- Allow Supabase client roles to query/insert rows used by this app.
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public."user" to anon, authenticated;
grant select, insert, update, delete on table public."progress" to anon, authenticated;

alter table public."user" enable row level security;
alter table public."progress" enable row level security;

drop policy if exists "allow_select_user" on public."user";
drop policy if exists "allow_insert_user" on public."user";
drop policy if exists "allow_update_user" on public."user";

create policy "allow_select_user"
  on public."user"
  as permissive
  for select
  to anon, authenticated
  using (true);

create policy "allow_insert_user"
  on public."user"
  as permissive
  for insert
  to anon, authenticated
  with check (true);

create policy "allow_update_user"
  on public."user"
  as permissive
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "allow_select_progress" on public."progress";
drop policy if exists "allow_insert_progress" on public."progress";
drop policy if exists "allow_update_progress" on public."progress";
drop policy if exists "allow_delete_progress" on public."progress";

create policy "allow_select_progress"
  on public."progress"
  as permissive
  for select
  to anon, authenticated
  using (true);

create policy "allow_insert_progress"
  on public."progress"
  as permissive
  for insert
  to anon, authenticated
  with check (true);

create policy "allow_update_progress"
  on public."progress"
  as permissive
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "allow_delete_progress"
  on public."progress"
  as permissive
  for delete
  to anon, authenticated
  using (true);
