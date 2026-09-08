import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getProblemSet } from "@/data/problemSets";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ progress: [] });
  }
  const rows = await db
    .select({ setSlug: progress.setSlug, problemSlug: progress.problemSlug })
    .from(progress)
    .where(eq(progress.userId, session.user.id));
  return NextResponse.json({ progress: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { setSlug, problemSlug, solved } = body as {
    setSlug?: string;
    problemSlug?: string;
    solved?: boolean;
  };

  if (!setSlug || !problemSlug || typeof solved !== "boolean") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const set = getProblemSet(setSlug);
  if (!set) {
    return NextResponse.json({ error: "Unknown problem set" }, { status: 400 });
  }
  const problemExists = set.topics.some((t) =>
    t.problems.some((p) => p.slug === problemSlug)
  );
  if (!problemExists) {
    return NextResponse.json({ error: "Unknown problem" }, { status: 400 });
  }

  const userId = session.user.id;

  if (solved) {
    await db
      .insert(progress)
      .values({ userId, setSlug, problemSlug, solved: true })
      .onConflictDoUpdate({
        target: [progress.userId, progress.setSlug, progress.problemSlug],
        set: { solved: true, solvedAt: new Date() },
      });
  } else {
    await db
      .delete(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.setSlug, setSlug),
          eq(progress.problemSlug, problemSlug)
        )
      );
  }

  return NextResponse.json({ ok: true });
}
