import { NextResponse } from "next/server";
import { db } from "@/db";
import { progress, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { totalProblemCount } from "@/data/problemSets";

export async function GET() {
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
    .orderBy(sql`count(${progress.id}) desc`)
    .limit(100);

  return NextResponse.json({ leaderboard: rows, total: totalProblemCount() });
}
