import { auth } from "@/auth";
import { countProblems, problemSets, totalProblemCount } from "@/data/problemSets";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

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
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Track your <span className="text-primary">DSA</span> interview prep.
        </h1>
        <p className="mx-auto max-w-2xl text-muted sm:mx-0 sm:text-lg">
          {totalProblemCount()} curated problems across NeetCode 150 and the most
          frequently asked SWE interview questions. Sign in, check off problems as
          you solve them, and climb the leaderboard.
        </p>
        {!session?.user && (
          <Link
            href="/login"
            className="inline-block rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-lg shadow-sky-500/20 transition-opacity hover:opacity-90"
          >
            Sign in to start tracking
          </Link>
        )}
      </section>

      {session?.user && (
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            Your overall progress
          </h2>
          <p className="mt-2 text-2xl font-bold">
            {totalSolved} / {totalProblemCount()} solved
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all"
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
              className="glass-panel group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/30"
            >
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary">
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
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
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
