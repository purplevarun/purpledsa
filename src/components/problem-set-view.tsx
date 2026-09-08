"use client";

import { gfgSearchUrl } from "@/lib/links";
import type { ProblemSet } from "@/types/problems";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

const DIFF_LABEL: Record<string, string> = { E: "Easy", M: "Medium", H: "Hard" };
const DIFF_CLASS: Record<string, string> = {
  E: "text-easy bg-easy-bg",
  M: "text-medium bg-medium-bg",
  H: "text-hard bg-hard-bg",
};

export function ProblemSetView({
  set,
  total,
  initialSolved,
  isAuthed,
}: {
  set: ProblemSet;
  total: number;
  initialSolved: string[];
  isAuthed: boolean;
}) {
  const [solved, setSolved] = useState<Set<string>>(new Set(initialSolved));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "done">("all");
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const solvedCount = solved.size;
  const pct = total ? Math.round((solvedCount / total) * 100) : 0;

  function toggle(problemSlug: string) {
    if (!isAuthed) {
      window.location.href = "/login";
      return;
    }
    const nextSolved = !solved.has(problemSlug);
    setSolved((prev) => {
      const next = new Set(prev);
      if (nextSolved) next.add(problemSlug);
      else next.delete(problemSlug);
      return next;
    });
    startTransition(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setSlug: set.slug, problemSlug, solved: nextSolved }),
      }).catch(() => {
        setSolved((prev) => {
          const next = new Set(prev);
          if (nextSolved) next.delete(problemSlug);
          else next.add(problemSlug);
          return next;
        });
      });
    });
  }

  function toggleTopic(name: string) {
    setOpenTopics((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return set.topics
      .map((topic) => {
        const problems = topic.problems.filter((p) => {
          const matchesSearch = !q || p.name.toLowerCase().includes(q);
          const isDone = solved.has(p.slug);
          const matchesStatus =
            statusFilter === "all" || (statusFilter === "done" ? isDone : !isDone);
          return matchesSearch && matchesStatus;
        });
        return { ...topic, problems };
      })
      .filter((topic) => topic.problems.length > 0);
  }, [set.topics, search, statusFilter, solved]);

  let globalNum = 0;
  const numbering = new Map<string, number>();
  for (const topic of set.topics) {
    for (const p of topic.problems) {
      globalNum += 1;
      numbering.set(p.slug, globalNum);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-primary">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{set.title}</h1>
        <p className="mt-1 text-muted">{set.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="font-mono text-sm text-muted">
            {solvedCount} / {total} solved
          </span>
          <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-sm text-primary">{pct}%</span>
        </div>
        {!isAuthed && (
          <p className="mt-3 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to save your progress and appear on the leaderboard.
          </p>
        )}
      </div>

      <div className="sticky top-[57px] z-10 flex flex-wrap items-center gap-2 border-b border-border bg-background py-3">
        <input
          type="text"
          placeholder="Search problems…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[160px] flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "todo" | "done")}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All problems</option>
          <option value="todo">Not done</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredTopics.map((topic) => {
          const doneInTopic = topic.problems.filter((p) => solved.has(p.slug)).length;
          const isOpen = openTopics.has(topic.name) || search.trim().length > 0;
          return (
            <div key={topic.name} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => toggleTopic(topic.name)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-primary/5"
              >
                <span className={`text-primary transition-transform ${isOpen ? "rotate-90" : ""}`}>
                  ▸
                </span>
                <span className="flex-1 font-semibold">{topic.name}</span>
                <span className="font-mono text-sm text-muted">
                  {doneInTopic} / {topic.problems.length}
                </span>
              </button>
              {isOpen && (
                <ul className="divide-y divide-border px-2 pb-2">
                  {topic.problems.map((p) => {
                    const isDone = solved.has(p.slug);
                    return (
                      <li
                        key={p.slug}
                        className={`flex flex-wrap items-center gap-2 px-2 py-2.5 ${isDone ? "bg-easy-bg/40" : ""
                          }`}
                      >
                        <span className="w-8 shrink-0 font-mono text-xs text-muted">
                          {numbering.get(p.slug)}.
                        </span>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(p.slug)}
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`min-w-[140px] flex-1 text-sm font-medium hover:text-primary hover:underline ${isDone ? "text-muted line-through" : ""
                            }`}
                        >
                          {p.name}
                        </a>
                        <a
                          href={gfgSearchUrl(p.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted hover:border-primary hover:text-primary"
                        >
                          GFG
                        </a>
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${DIFF_CLASS[p.difficulty]}`}
                        >
                          {DIFF_LABEL[p.difficulty]}
                        </span>
                        {p.locked && (
                          <span
                            title="LeetCode Premium-locked — link opens the free NeetCode version instead."
                            className="shrink-0 cursor-help rounded border border-medium bg-medium-bg px-2 py-0.5 font-mono text-[10px] text-medium"
                          >
                            🔒
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
        {filteredTopics.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">
            No problems match your search/filter.
          </p>
        )}
      </div>
    </div>
  );
}
