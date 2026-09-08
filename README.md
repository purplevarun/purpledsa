# PurpleDSA

Track your DSA interview prep. Sign in, check off problems as you solve them across NeetCode 150 and a curated Top Interview Questions set, and climb the leaderboard.

- ✅ NeetCode 150 problem coverage
- ✅ Top Interview Questions set
- ✅ Username/password auth using a Postgres-backed `user` table
- ✅ Leaderboard and progress tracking
- ✅ Minimal dark/light mode UI
- ✅ Designed to run on Vercel with Supabase Postgres

## Tech stack

- Vercel for hosting
- Postgres via Supabase
- Drizzle ORM
- Next.js for the current app shell
- Custom credential auth using the existing `user` table
- GitHub Actions for DB keepalive

## What you need for Supabase

1. Create a new project at https://supabase.com
2. Go to Project Settings → Database
3. Copy the connection string for Postgres
4. Add it to your local `.env.local` and Vercel env vars as `DATABASE_URL`
5. Generate an auth secret and set it as `AUTH_SECRET`
6. Optionally enable Supabase Auth later if you want email/social login in the future

## Required environment variables

Create a `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

Then fill in the values:

```bash
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.xxxxxx.supabase.co:5432/postgres"
AUTH_SECRET="replace-with-a-random-secret"
```

Optional:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

> Docker is optional. You do not need Docker if you are using Supabase as the real database.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

3. Start the app:

   ```bash
   ./run dev
   ```

4. Run the DB migration:

   ```bash
   npm run db:migrate
   ```

5. Open the app and sign in.

## Supabase database setup

Create the required tables in the Supabase SQL editor.

This project expects a `user` table matching the schema in `src/db/schema.ts`.

Example SQL:

```sql
create table public.user (
  id text primary key,
  username text not null unique,
  name text,
  email text unique,
  "emailVerified" timestamptz,
  image text,
  "passwordHash" text,
  "createdAt" timestamptz not null default now()
);

create table public.progress (
  id text primary key,
  "userId" text not null references public.user(id) on delete cascade,
  "setSlug" text not null,
  "problemSlug" text not null,
  solved boolean not null default true,
  "solvedAt" timestamptz not null default now(),
  unique ("userId", "setSlug", "problemSlug")
);
```

If you want to use the current Drizzle schema exactly, the project expects these table names and columns to exist.

## Vercel deployment

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add these environment variables in Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
4. Deploy the app.
5. Run the migration once against production:

   ```bash
   DATABASE_URL="<your-supabase-connection-string>" npm run db:migrate
   ```

## GitHub Action keepalive

There is a scheduled workflow in `.github/workflows/supabase-keepalive.yml`.

It runs once a day and pings the Supabase database to prevent idle shutdown.

To enable it:

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add a secret named `SUPABASE_DB_URL`
3. Set it to your Supabase Postgres connection string

## Notes

- `.env.local` should never be committed.
- `.env.example` is the template for local setup.
- Docker is optional and only useful for a local Postgres fallback.
- If you later migrate the frontend to Vite + React, the same Supabase DB and Vercel backend pattern still applies.

## Useful scripts

```bash
npm install
./run dev
npm run db:generate
npm run db:migrate
npm run build
```

## Updating data sets

```bash
npm run extract:neetcode150
```

This regenerates the NeetCode 150 data in `src/data/neetcode150.ts`.
