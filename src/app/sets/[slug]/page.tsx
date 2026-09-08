import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getProblemSet, countProblems } from "@/data/problemSets";
import { ProblemSetView } from "@/components/problem-set-view";

export const dynamic = "force-dynamic";

export default async function ProblemSetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const set = getProblemSet(slug);
  if (!set) notFound();

  const session = await auth();
  let solved: string[] = [];
  if (session?.user?.id) {
    const rows = await db
      .select({ problemSlug: progress.problemSlug })
      .from(progress)
      .where(and(eq(progress.userId, session.user.id), eq(progress.setSlug, slug)));
    solved = rows.map((r) => r.problemSlug);
  }

  return (
    <ProblemSetView
      set={set}
      total={countProblems(set)}
      initialSolved={solved}
      isAuthed={!!session?.user}
    />
  );
}
