# PurpleDSA

Track your DSA interview prep. Sign in, check off problems as you solve them
across **NeetCode 150** and a curated **Top Interview Questions** set, and
climb the leaderboard against everyone else using the app.

- ✅ NeetCode 150 — all 150 problems, 18 patterns, with LeetCode/NeetCode links
- ✅ Top Interview Questions — ~45 additional frequently-asked SWE interview problems
- ✅ Simple username/password login stored in the same Postgres DB
- ✅ Public leaderboard ranked by problems solved
- ✅ Dark/light mode, fast, simple UI
- ✅ 100% free to host (Vercel + Neon free tiers)

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS v4
- [Auth.js (NextAuth v5)](https://authjs.dev) with a credential-based username/password flow
- [Drizzle ORM](https://orm.drizzle.team) + Postgres via [postgres.js](https://github.com/porsager/postgres)
  (works identically against local Docker Postgres and hosted [Neon](https://neon.tech) —
  chosen over Prisma, which requires native binary downloads that some
  networks/CI block)

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the local Postgres and app**

   ```bash
   ./run up
   ```

   This runs Postgres 16 in Docker on `localhost:5432` with a `purpledsa` DB and
   starts the Next.js app on `http://localhost:3000`.

3. **Create a `.env.local` file with the local DB**

   ```bash
   cp .env.example .env.local
   ```

   Your local `.env.local` should include:

   ```bash
   DATABASE_URL="postgresql://purpledsa@localhost:5432/purpledsa"
   AUTH_SECRET="<generate-with-npx-auth-secret>"
   ```

4. **Create and apply the database schema**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   These commands read `.env.local` automatically and work with the local DB.

5. **Sign in**

   Open [http://localhost:3000/login](http://localhost:3000/login) and create a username/password.
   The first time a user signs in, they are automatically created in the same Postgres DB.

## Deploying to Vercel (free)

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. In Vercel, add:
   - `DATABASE_URL` = your Neon Postgres URL
   - `AUTH_SECRET` = a generated secret
4. Deploy. Once the app is live, run:

   ```bash
   DATABASE_URL="<your-neon-url>" npm run db:migrate
   ```

   to apply the schema in production.

## Neon setup

1. Create a free project at [neon.tech](https://neon.tech).
2. Create a database and copy the connection string.
3. Use the connection string as `DATABASE_URL` in your Vercel environment variables.
4. Generate a new `AUTH_SECRET` with:

   ```bash
   npx auth secret
   ```

5. Deploy the app and run the migration once against Neon:

   ```bash
   DATABASE_URL="<your-neon-url>" npm run db:migrate
   ```

> **Note:** if building locally, make sure `NODE_ENV` isn't already exported
> in your shell (`env -u NODE_ENV npm run build`) — some Next.js versions crash
> during `next build` if a stray `NODE_ENV=development` is present. Vercel's
> build environment doesn't have this issue.

## Updating the NeetCode 150 data

The NeetCode 150 problem set is generated from `NC_150.html` (the original
tracker page it was adapted from) rather than hand-transcribed:

```bash
npm run extract:neetcode150
```

This regenerates `src/data/neetcode150.ts`. The **Top Interview Questions**
set lives in `src/data/topInterview.ts` and is hand-curated — edit it directly
to add/remove problems.

## Project structure

```
src/
  app/            Next.js App Router pages + API routes
  components/     UI components (navbar, theme toggle, problem list)
  data/           Problem set data (NeetCode 150 + Top Interview Questions)
  db/             Drizzle schema + client
  lib/            Small helpers (GFG search link generator)
  types/          Shared TypeScript types
scripts/          One-off data extraction script
```
