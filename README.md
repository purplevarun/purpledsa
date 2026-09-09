# PurpleDSA

Track your DSA interview prep. Sign in, check off problems as you solve them across NeetCode 150 and a curated Top Interview Questions set, and climb the leaderboard.

- ✅ NeetCode 150 problem coverage
- ✅ Top Interview Questions set
- ✅ Username/password auth using a Supabase-backed `user` table
- ✅ Leaderboard and progress tracking
- ✅ Minimal dark/light mode UI
- ✅ Designed to run on Vercel with Supabase Postgres

## Tech stack

- Vercel for hosting
- Supabase Postgres and client
- Vite + React for the app shell
- Custom credential auth using the Supabase `user` table

## What you need for Supabase

1. Create a new project at https://supabase.com
2. Go to Project Settings → Database
3. Copy the project URL and anon key
4. Add them to `.env.local` and your hosting provider's environment variables

## Required environment variables

Create a `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

Then fill in the values:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

Use the exact same values in both places if you want local and production to share one database:

1. Local `.env.local`
2. Vercel project environment variables

If those values differ, local and production will point to different Supabase projects.

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

4. Open the app and sign in.

## Supabase database setup

Create the required tables in the Supabase SQL editor.

Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor. It creates tables, indexes, grants, and RLS policies used by login and leaderboard queries.

## Vercel deployment

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add these environment variables in Vercel:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
4. Deploy the app.

## Notes

- `.env.local` should never be committed.
- `.env.example` is the template for local setup.
- The Supabase SQL schema is in `supabase-schema.sql`.

## Useful scripts

```bash
npm install
./run dev
npm run build
```
