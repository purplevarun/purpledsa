# PurpleDSA

Track your DSA interview prep. Sign in, check off problems as you solve them
across **NeetCode 150** and a curated **Top Interview Questions** set, and
climb the leaderboard against everyone else using the app.

- ✅ NeetCode 150 — all 150 problems, 18 patterns, with LeetCode/NeetCode links
- ✅ Top Interview Questions — ~45 additional frequently-asked SWE interview problems
- ✅ GitHub sign-in, per-user progress saved to Postgres
- ✅ Public leaderboard ranked by problems solved
- ✅ Dark/light mode, fast, simple UI
- ✅ 100% free to host (Vercel + Neon free tiers)

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS v4
- [Auth.js (NextAuth v5)](https://authjs.dev) with the GitHub provider
- [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) serverless Postgres
  (chosen over Prisma — no native binary downloads required, which matters on
  networks/CI that block binary CDNs)

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a free Postgres database** at [neon.tech](https://neon.tech) (or any
   Postgres provider) and copy its connection string.

3. **Create a GitHub OAuth App** at
   [github.com/settings/developers](https://github.com/settings/developers):
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

4. **Copy the env file and fill in the values**

   ```bash
   cp .env.example .env.local
   npx auth secret   # generates AUTH_SECRET into .env.local
   ```

5. **Push the database schema**

   ```bash
   npm run db:push
   ```

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel (free)

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel project
   settings (use the production GitHub OAuth App callback URL:
   `https://<your-app>.vercel.app/api/auth/callback/github`).
4. Deploy. Run `npm run db:push` locally (pointed at your production
   `DATABASE_URL`) once to create the tables in your production database.

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

