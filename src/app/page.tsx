import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { problemSets, countProblems, totalProblemCount } from "@/data/problemSets";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  let solvedBySet = new Map<string, number>();
  if (session?.user?.id) {
    const rows = await db
      .select({ setSlug: progress.setSlug })
      .from(progress)
      .where(eq(progress.userId, session.user.id));
    solvedBySet = rows.reduce((map, r) => {
      map.set(r.setSlug, (map.get(r.setSlug) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
  }

  const totalSolved = [...solvedBySet.values()].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-10">
      <section className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Track your <span className="text-primary">DSA</span> interview prep.
        </h1>
        <p className="max-w-2xl text-muted sm:text-lg mx-auto sm:mx-0">
          {totalProblemCount()} curated problems across NeetCode 150 and the most
          frequently asked SWE interview questions. Sign in, check off problems as
          you solve them, and climb the leaderboard.
        </p>
        {!session?.user && (
          <Link
            href="/login"
            className="inline-block rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
          >
            Sign in to start tracking
          </Link>
        )}
      </section>

      {session?.user && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Your overall progress
          </h2>
          <p className="mt-1 text-2xl font-bold">
            {totalSolved} / {totalProblemCount()} solved
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{
                width: `${totalProblemCount() ? (totalSolved / totalProblemCount()) * 100 : 0}%`,
              }}
            />
          </div>
        </section>
      )}

      <section className="grid gap-5 sm:grid-cols-2">
        {problemSets.map((set) => {
          const total = countProblems(set);
          const solved = solvedBySet.get(set.slug) ?? 0;
          const pct = total ? Math.round((solved / total) * 100) : 0;
          return (
            <Link
              key={set.slug}
              href={`/sets/${set.slug}`}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <h3 className="text-lg font-bold group-hover:text-primary">
                {set.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{set.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-mono text-muted">
                  {session?.user ? `${solved} / ${total} solved` : `${total} problems`}
                </span>
                {session?.user && <span className="font-mono text-primary">{pct}%</span>}
              </div>
              {session?.user && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

