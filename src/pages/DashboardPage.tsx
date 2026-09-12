import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../app/Header";
import { useAuth } from "../auth/AuthProvider";
import {
	countProblems,
	GLOBAL_PROGRESS_SET_SLUG,
	problemSets,
} from "../data/problemSets";
import { fetchAcceptedSubmissions } from "../lib/leetcodeApi";
import { supabase, supabaseConfigError } from "../lib/supabase";

const tileDescriptions: Record<string, string> = {
	"all-dsa-questions": "Every coding problem, without duplicates.",
	"free-dsa-essentials": "100 free exercises across seven platforms.",
	"neetcode-150": "Core interview patterns, step by step.",
	"top-interview": "Frequently asked coding interview problems.",
	"blind-75": "High-frequency interview fundamentals.",
	cses: "Competitive programming essentials.",
	lld: "Judged class design and concurrency practice.",
	hld: "Amazon, Netflix, BookMyShow, and system design.",
};

type ProgressCountRow = {
	setSlug: string;
	problemSlug: string;
	solved: boolean;
};

export const DashboardPage = () => {
	const { user } = useAuth();
	const [solvedCountBySet, setSolvedCountBySet] = useState<
		Record<string, number>
	>({});
	const [syncing, setSyncing] = useState(false);
	const [syncError, setSyncError] = useState("");
	const [syncSuccess, setSyncSuccess] = useState("");
	const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

	const totalCountBySet = useMemo(() => {
		return problemSets.reduce<Record<string, number>>((acc, set) => {
			acc[set.slug] = countProblems(set);
			return acc;
		}, {});
	}, []);

	const loadProgress = useCallback(async () => {
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
		const solvedCodeSet = new Set(
			rows.filter((row) => row.solved).map((row) => row.problemSlug),
		);

		const nextCounts = problemSets.reduce<Record<string, number>>(
			(acc, set) => {
				const uniqueCodes = new Set<string>();
				for (const topic of set.topics) {
					for (const problem of topic.problems) {
						uniqueCodes.add(problem.code);
					}
				}

				let solved = 0;
				for (const code of uniqueCodes) {
					if (solvedCodeSet.has(code)) solved += 1;
				}

				acc[set.slug] = solved;
				return acc;
			},
			{},
		);

		setSolvedCountBySet(nextCounts);
	}, [user]);

	useEffect(() => {
		loadProgress();
	}, [loadProgress]);

	useEffect(() => {
		if (!user) {
			setLastSyncedAt(null);
			return;
		}

		const key = `purpledsa-last-synced-at:${user.id}`;
		setLastSyncedAt(localStorage.getItem(key));
	}, [user]);

	const normalizeText = (value: string) => {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, " ")
			.trim();
	};

	const extractLeetCodeSlug = (url: string) => {
		try {
			const parsed = new URL(url);
			const match = parsed.pathname.match(/\/problems\/([^/]+)/);
			return match?.[1] || null;
		} catch {
			return null;
		}
	};

	const syncProgress = async (isAuto: boolean) => {
		if (!user) {
			setSyncError("Sign in to sync progress");
			return;
		}

		const cleanLeetCodeUsername = (
			user.leetcodeUsername ||
			user.username ||
			""
		).trim();
		if (!cleanLeetCodeUsername) {
			setSyncError("Set your LeetCode username in Settings first");
			return;
		}

		if (!supabase) {
			setSyncError(`Supabase is not configured. ${supabaseConfigError}`);
			return;
		}

		try {
			setSyncing(true);
			setSyncError("");
			setSyncSuccess("");

			const { submissions, publicSolvedCount } =
				await fetchAcceptedSubmissions(cleanLeetCodeUsername, 5000);

			const referencesBySlug = new Map<string, Set<string>>();
			const referencesByTitle = new Map<string, Set<string>>();

			for (const set of problemSets) {
				for (const topic of set.topics) {
					for (const problem of topic.problems) {
						if (!problem.url.includes("leetcode.com/problems/"))
							continue;

						for (const slugKey of [
							problem.code,
							extractLeetCodeSlug(problem.url),
						]) {
							if (!slugKey) continue;
							if (!referencesBySlug.has(slugKey)) {
								referencesBySlug.set(slugKey, new Set());
							}
							referencesBySlug.get(slugKey)?.add(problem.code);
						}

						const titleKey = normalizeText(problem.name);
						if (!referencesByTitle.has(titleKey)) {
							referencesByTitle.set(titleKey, new Set());
						}
						referencesByTitle.get(titleKey)?.add(problem.code);
					}
				}
			}

			const solvedRows: Array<{
				id: string;
				userId: string;
				setSlug: string;
				problemSlug: string;
				solved: boolean;
				solvedAt: string;
			}> = [];

			const uniqueCodes = new Set<string>();
			for (const item of submissions) {
				const refsBySlug = item.titleSlug
					? referencesBySlug.get(item.titleSlug) || new Set<string>()
					: new Set<string>();
				const refsByTitle = item.title
					? referencesByTitle.get(normalizeText(item.title)) ||
						new Set<string>()
					: new Set<string>();

				for (const problemCode of new Set([
					...refsBySlug,
					...refsByTitle,
				])) {
					if (uniqueCodes.has(problemCode)) continue;
					uniqueCodes.add(problemCode);
					solvedRows.push({
						id: `${user.id}:${GLOBAL_PROGRESS_SET_SLUG}:${problemCode}`,
						userId: user.id,
						setSlug: GLOBAL_PROGRESS_SET_SLUG,
						problemSlug: problemCode,
						solved: true,
						solvedAt: new Date().toISOString(),
					});
				}
			}

			if (solvedRows.length) {
				const { error: upsertError } = await supabase
					.from("progress")
					.upsert(solvedRows, {
						onConflict: "userId,setSlug,problemSlug",
						ignoreDuplicates: true,
					});

				if (upsertError) {
					const detail = (upsertError.message || "").toLowerCase();
					if (
						detail.includes("permission denied") ||
						detail.includes("row-level security")
					) {
						throw new Error(
							'Could not sync progress. Supabase permissions/policies are missing for table "progress".',
						);
					}
					throw new Error("Could not sync progress");
				}
			}

			await loadProgress();

			const syncedAt = new Date().toISOString();
			localStorage.setItem(
				`purpledsa-last-synced-at:${user.id}`,
				syncedAt,
			);
			setLastSyncedAt(syncedAt);

			const solvedCountHint =
				publicSolvedCount === null
					? "Public solved count unavailable."
					: `Public solved count: ${publicSolvedCount}.`;

			setSyncSuccess(
				`${isAuto ? "Auto sync" : "Sync"} complete. Matched ${solvedRows.length} unique problems from ${submissions.length} recent accepted submissions fetched (max 20). ${solvedCountHint}`,
			);
		} catch (err) {
			setSyncError(
				err instanceof Error ? err.message : "Could not sync progress",
			);
		} finally {
			setSyncing(false);
		}
	};

	useEffect(() => {
		if (!user) return;

		const key = `purpledsa-last-auto-sync-date:${user.id}`;
		const today = new Date().toISOString().slice(0, 10);
		const lastAutoSyncDate = localStorage.getItem(key);
		if (lastAutoSyncDate === today) return;

		localStorage.setItem(key, today);
		syncProgress(true);
	}, [user]);

	return (
		<div className="app-shell dashboard-shell">
			<Header
				onSync={() => syncProgress(false)}
				syncing={syncing}
				lastSyncedAt={lastSyncedAt}
			/>

			<div className="dashboard-status" aria-live="polite">
				{syncError && (
					<p className="dashboard-status-error" title={syncError}>
						{syncError}
					</p>
				)}
				{syncSuccess && (
					<p className="dashboard-status-success" title={syncSuccess}>
						{syncSuccess}
					</p>
				)}
			</div>

			<div className="grid dashboard-grid">
				{problemSets.map((set) => (
					<Link
						key={set.slug}
						to={`/sets/${set.slug}`}
						className="dashboard-set-link"
					>
						<div className="card dashboard-set-card">
							<h3>{set.title}</h3>
							<p title={set.description}>
								{tileDescriptions[set.slug] ?? set.description}
							</p>
							<small>
								{solvedCountBySet[set.slug] || 0}/
								{totalCountBySet[set.slug]} solved ·{" "}
								{set.topics.length} topics
							</small>
						</div>
					</Link>
				))}
			</div>

			<footer className="dashboard-footer">
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
};
