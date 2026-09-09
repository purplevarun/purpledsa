import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../app/AppHeader";
import { useAuth } from "../auth/AuthProvider";
import { countProblems, problemSets } from "../data/problemSets";
import { supabase } from "../lib/supabase";

type ProgressCountRow = {
	setSlug: string;
	problemSlug: string;
	solved: boolean;
};

export function DashboardPage() {
	const { user } = useAuth();
	const [solvedCountBySet, setSolvedCountBySet] = useState<Record<string, number>>({});

	const totalCountBySet = useMemo(() => {
		return problemSets.reduce<Record<string, number>>((acc, set) => {
			acc[set.slug] = countProblems(set);
			return acc;
		}, {});
	}, []);

	useEffect(() => {
		const loadProgress = async () => {
			if (!user || !supabase) {
				setSolvedCountBySet({});
				return;
			}

			const { data, error } = await supabase
				.from("progress")
				.select("setSlug, problemSlug, solved")
				.eq("userId", user.id)
				.eq("solved", true);

			if (error) {
				setSolvedCountBySet({});
				return;
			}

			const rows = (data ?? []) as ProgressCountRow[];
			const uniqueSolvedBySet = new Map<string, Set<string>>();

			for (const row of rows) {
				if (!row.solved) continue;
				if (!uniqueSolvedBySet.has(row.setSlug)) {
					uniqueSolvedBySet.set(row.setSlug, new Set());
				}
				uniqueSolvedBySet.get(row.setSlug)?.add(row.problemSlug);
			}

			const nextCounts: Record<string, number> = {};
			for (const [setSlug, solved] of uniqueSolvedBySet.entries()) {
				nextCounts[setSlug] = solved.size;
			}

			setSolvedCountBySet(nextCounts);
		};

		loadProgress();
	}, [user]);

	return (
		<div className="app-shell">
			<AppHeader />

			<section className="card">
				<h1>Track your DSA interview prep.</h1>
				<p style={{ color: "var(--muted)" }}>
					Stay consistent and keep momentum on the problem sets you
					care about.
				</p>
			</section>

			<div className="grid grid-2" style={{ marginTop: 20 }}>
				{problemSets.map((set) => (
					<Link
						key={set.slug}
						to={`/sets/${set.slug}`}
						style={{ textDecoration: "none", color: "inherit" }}
					>
						<div className="card">
							<h3>{set.title}</h3>
							<p style={{ color: "var(--muted)" }}>
								{set.description}
							</p>
							<small>
								{solvedCountBySet[set.slug] || 0}/{totalCountBySet[set.slug]} solved
								· {set.topics.length} topics
							</small>
						</div>
					</Link>
				))}
			</div>

			<footer>
				Built by{" "}
				<a
					href="https://github.com/purplevarun"
					target="_blank"
					rel="noreferrer"
				>
					purplevarun
				</a>
			</footer>
		</div>
	);
}
