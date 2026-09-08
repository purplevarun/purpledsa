import { db } from "@/db";
import { progress, users } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { totalProblemCount } from "@/data/problemSets";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await auth();
  const total = totalProblemCount();

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      image: users.image,
      solvedCount: sql<number>`count(${progress.id})`.mapWith(Number),
    })
    .from(users)
    .innerJoin(progress, eq(progress.userId, users.id))
    .where(eq(progress.solved, true))
    .groupBy(users.id, users.name, users.image)
    .orderBy(desc(sql`count(${progress.id})`))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-muted">
          Ranked by total problems solved across all sets ({total} possible).
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No one has solved a problem yet — be the first!
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row, i) => {
              const isMe = session?.user?.id === row.userId;
              const pct = total ? Math.round((row.solvedCount / total) * 100) : 0;
              return (
                <li
                  key={row.userId}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-primary/10" : ""}`}
                >
                  <span className="w-6 shrink-0 text-center font-mono text-sm text-muted">
                    {i + 1}
                  </span>
                  {row.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.image}
                      alt={row.name ?? "User"}
                      className="h-8 w-8 shrink-0 rounded-full border border-border"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
                      {(row.name ?? "?")[0]}
                    </span>
                  )}
                  <span className="flex-1 truncate font-medium">
                    {row.name ?? "Anonymous"} {isMe && <span className="text-primary">(you)</span>}
                  </span>
                  <span className="font-mono text-sm text-muted">{pct}%</span>
                  <span className="w-20 shrink-0 text-right font-mono text-sm font-semibold text-primary">
                    {row.solvedCount} solved
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
