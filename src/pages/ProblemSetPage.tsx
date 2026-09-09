import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "../app/AppHeader";
import { useAuth } from "../auth/AuthProvider";
import { problemSets } from "../data/problemSets";
import { supabase, supabaseConfigError } from "../lib/supabase";

type ProgressRow = {
	problemSlug: string;
	solved: boolean;
};

export function ProblemSetPage() {
	const { slug } = useParams();
	const { user } = useAuth();
	const set = problemSets.find((item) => item.slug === slug);
	const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
	const [savingSlugs, setSavingSlugs] = useState<Set<string>>(new Set());
	const [error, setError] = useState("");

	const setSlug = useMemo(() => set?.slug || null, [set]);

	useEffect(() => {
		const loadSolved = async () => {
			if (!setSlug || !user || !supabase) {
				setSolvedSlugs(new Set());
				return;
			}

			const { data, error } = await supabase
				.from("progress")
				.select("problemSlug, solved")
				.eq("userId", user.id)
				.eq("setSlug", setSlug);

			if (error) {
				setSolvedSlugs(new Set());
				setError("Could not load saved progress");
				return;
			}

			setError("");
			setSolvedSlugs(
				new Set(
					((data ?? []) as ProgressRow[])
						.filter((row) => row.solved)
						.map((row) => row.problemSlug),
				),
			);
		};

		loadSolved();
	}, [setSlug, user]);

	async function toggleSolved(problemSlug: string) {
		if (!setSlug) return;
		if (!user) {
			setError("Sign in to track your progress");
			return;
		}
		if (!supabase) {
			setError(`Supabase is not configured. ${supabaseConfigError}`);
			return;
		}

		const currentlySolved = solvedSlugs.has(problemSlug);
		setError("");
		setSavingSlugs((prev) => new Set(prev).add(problemSlug));

		setSolvedSlugs((prev) => {
			const next = new Set(prev);
			if (currentlySolved) next.delete(problemSlug);
			else next.add(problemSlug);
			return next;
		});

		let requestError: string | null = null;
		if (currentlySolved) {
			const { error: deleteError } = await supabase
				.from("progress")
				.delete()
				.eq("userId", user.id)
				.eq("setSlug", setSlug)
				.eq("problemSlug", problemSlug);

			if (deleteError) requestError = "Could not update progress";
		} else {
			const { error: upsertError } = await supabase
				.from("progress")
				.upsert(
					[
						{
							id: `${user.id}:${setSlug}:${problemSlug}`,
							userId: user.id,
							setSlug,
							problemSlug,
							solved: true,
							solvedAt: new Date().toISOString(),
						},
					],
					{ onConflict: "userId,setSlug,problemSlug" },
				);

			if (upsertError) requestError = "Could not update progress";
		}

		if (requestError) {
			setSolvedSlugs((prev) => {
				const next = new Set(prev);
				if (currentlySolved) next.add(problemSlug);
				else next.delete(problemSlug);
				return next;
			});
			setError(requestError);
		}

		setSavingSlugs((prev) => {
			const next = new Set(prev);
			next.delete(problemSlug);
			return next;
		});
	}

	if (!set) return <div className="app-shell">Set not found</div>;

	return (
		<div className="app-shell">
			<AppHeader />
			<h1>{set.title}</h1>
			<p style={{ color: "var(--muted)" }}>{set.description}</p>
			{error && <p style={{ color: "crimson" }}>{error}</p>}
			<div className="card" style={{ marginTop: 18 }}>
				{set.topics.map((topic) => (
					<div key={topic.name} style={{ marginBottom: 16 }}>
						<h3>{topic.name}</h3>
						<div style={{ display: "grid", gap: 8 }}>
							{topic.problems.map((problem) => (
								<div key={problem.slug} className="problem-row">
									<button
										type="button"
										className={`problem-check ${solvedSlugs.has(problem.slug) ? "checked" : ""}`}
										role="checkbox"
										aria-checked={solvedSlugs.has(problem.slug)}
										onClick={() => toggleSolved(problem.slug)}
										disabled={savingSlugs.has(problem.slug)}
										aria-label={`Mark ${problem.name} as solved`}
									/>
									<a
										className="problem-name selectable"
										href={problem.url}
										target="_blank"
										rel="noreferrer"
									>
										{problem.name}
									</a>
									<div className="platform-links">
										<a
											href={`https://www.geeksforgeeks.org/?s=${encodeURIComponent(problem.name)}`}
											target="_blank"
											rel="noreferrer"
										>
											GFG
										</a>
										<a
											href={problem.url}
											target="_blank"
											rel="noreferrer"
										>
											LeetCode
										</a>
										<a
											href={
												problem.url.includes(
													"neetcode.io",
												)
													? problem.url
													: `https://neetcode.io/problems/${problem.slug}`
											}
											target="_blank"
											rel="noreferrer"
										>
											NeetCode
										</a>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
