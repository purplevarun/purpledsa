import type { ProblemSet } from "@/types/problems";
import { neetcode150 } from "@/data/neetcode150";
import { topInterview } from "@/data/topInterview";

export const problemSets: ProblemSet[] = [
  {
    slug: "neetcode-150",
    title: "NeetCode 150",
    description: "The classic 150 problems across 18 patterns — the essential DSA interview foundation.",
    topics: neetcode150,
  },
  {
    slug: "top-interview",
    title: "Top Interview Questions",
    description: "Frequently-asked SWE interview problems that go beyond the NeetCode 150.",
    topics: topInterview,
  },
];

export function getProblemSet(slug: string): ProblemSet | undefined {
  return problemSets.find((s) => s.slug === slug);
}

export function countProblems(set: ProblemSet): number {
  return set.topics.reduce((sum, t) => sum + t.problems.length, 0);
}

export function totalProblemCount(): number {
  return problemSets.reduce((sum, s) => sum + countProblems(s), 0);
}
