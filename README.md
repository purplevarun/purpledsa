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

The app also accepts `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY`. If both naming styles are set, the `VITE_PUBLIC_*` values take precedence.

These `VITE_*` values are bundled into the browser app. Use only the public anon key, never a Supabase service-role key.

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

## Problem data

Free DSA Essentials is PurpleDSA's own collection of 100 coding exercises across nine topic groups. The former Striver/A2Z sheet has been removed, including its paid practice and lesson-only links. The collection is available at `/sets/free-dsa-essentials`.

| Platform      | Exercises | Progress       |
| ------------- | --------: | -------------- |
| LeetCode      |        42 | Automatic sync |
| NeetCode      |         5 | Manual         |
| GeeksforGeeks |        15 | Manual         |
| SPOJ          |        11 | Manual         |
| CodeChef      |         7 | Manual         |
| Codeforces    |        10 | Manual         |
| CSES          |        10 | Manual         |

Only free submissions belong in the collection; a free account may be required. Premium courses, editorials, hints, and AI features are outside its scope. Settings lists the platform breakdown and links to filtered exercise lists. The master index contains only exercises in active coding sets; design sets are separate.

Access was audited on September 10, 2026 against LeetCode's public `paid_only` metadata, the GFG and Codeforces catalogs, CodeChef's practice API (judge enabled; login is the only reported submission restriction), NeetCode's free practice pages, and CSES task pages. Three unavailable CodeChef candidates were excluded. SPOJ uses its canonical classical problem URLs, but its browser-security challenge prevented automated live-page verification; no actual judge submissions were made during verification.

Keep problem codes stable when correcting names or URLs because saved progress uses those codes. GFG practice links must use the exact `/problems/<slug>/1` URL; never derive slugs from titles or substitute search URLs. Use a verified free equivalent for premium LeetCode questions, not merely `locked: false`. Platform buttons display supplied practice links or supported HLD articles with their actual website labels.

### HLD Study Guides

The HLD sheet at `/sets/hld` contains 15 original study guides and architecture diagrams, 45 self-check questions with answers, 32 reading selections, and 15 video selections (13 distinct videos). The guides cover requirements, explicit sizing assumptions and worked estimates, API contracts, data models, request flows, trade-offs, failure recovery, and operational metrics. These are interview study scenarios, not claims about a company's actual traffic or a single universally correct architecture. Explanations and diagrams are original; external articles and videos are linked and attributed, not copied.

The reader supports topic search, mobile topic selection, keyboard-accessible section tabs, expandable answers, and zoomable/downloadable diagrams. Link directly to a topic with `/sets/hld?guide=design-payment-system&section=guide`; sections are `guide`, `architecture`, `review`, and `resources`. Diagrams use Mermaid in strict mode with native SVG text and are loaded on demand with the study view. The "studied" checkbox is self-reported and reuses existing progress IDs; it does not claim an assessment or code submission. Coding sheets and LLD are unchanged.

Readings include Hello Interview, GeeksforGeeks, ByteByteGo, Stripe Engineering, and official PostgreSQL, Redis, Confluent, Elastic, Flink, H3, Apple, Google, and TensorFlow documentation, plus Chris Richardson's architectural patterns. Broader topics use concrete examples: Kafka for pub/sub, video recommendations, ad-click aggregation, and local delivery. The food-delivery guide explicitly distinguishes a restaurant marketplace from Gopuff's warehouse model.

Resources were reviewed on September 10, 2026. Paid Hello Interview cache/payment breakdowns were excluded. Video IDs and titles were verified against creator-published pages, but the local network blocks YouTube, so playback, captions, and regional availability were not tested. Focused companion videos are labeled as such instead of being presented as full topic walkthroughs. External access policies can change. Tests validate guide coverage, direct destinations, and the reviewed topic/video mappings; they are not a live availability monitor.

Video provenance:

| Video                               | Publisher reference                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Bitly (`iUU4O1sWtJA`)               | [Hello Interview: Bitly](https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly)                             |
| Rate limiter (`MIJFyUPG4Z4`)        | [Hello Interview: rate limiter](https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter)   |
| Redis (`fmT5nlEkl3U`)               | [Hello Interview: Redis](https://www.hellointerview.com/learn/system-design/deep-dives/redis)                                     |
| Session vs JWT (`fyTxwIa-1U0`)      | [ByteByteGo EP122](https://blog.bytebytego.com/p/ep122-api-gateway-101)                                                           |
| WhatsApp (`cr6p0n0N-VA`)            | [Hello Interview: WhatsApp](https://www.hellointerview.com/learn/system-design/problem-breakdowns/whatsapp)                       |
| Kafka (`DU8o-OTeoCc`)               | [Hello Interview: Kafka](https://www.hellointerview.com/learn/system-design/deep-dives/kafka)                                     |
| Elasticsearch (`PuZvF2EyfBM`)       | [Hello Interview: Elasticsearch](https://www.hellointerview.com/learn/system-design/deep-dives/elasticsearch)                     |
| News feed (`Qj4-GruzyDU`)           | [Hello Interview: news feed](https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed)                  |
| Recommendations (`jz0-satrmrA`)     | [TensorFlow Recommenders](https://www.tensorflow.org/recommenders)                                                                |
| Ad-click aggregator (`Zcv_899yqhI`) | [Hello Interview: ad-click aggregator](https://www.hellointerview.com/learn/system-design/problem-breakdowns/ad-click-aggregator) |
| Uber (`lsKU38RKQSo`)                | [Hello Interview: Uber](https://www.hellointerview.com/learn/system-design/problem-breakdowns/uber)                               |
| YouTube (`IUrQ5_g3XKs`)             | [Hello Interview: YouTube](https://www.hellointerview.com/learn/system-design/problem-breakdowns/youtube)                         |
| ACID (`GAe5oB742dw`)                | [ByteByteGo EP105](https://blog.bytebytego.com/p/ep105-the-12-factor-app)                                                         |

Run the data and link regression checks with Node.js 22.6 or newer:

```bash
node --experimental-strip-types --test tests/problem-data.test.ts
```
