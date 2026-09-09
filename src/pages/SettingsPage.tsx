import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppHeader } from "../app/AppHeader";
import { useAuth } from "../auth/AuthProvider";
import { problemSets } from "../data/problemSets";
import { fetchAcceptedSubmissions } from "../lib/leetcodeApi";
import { supabase, supabaseConfigError } from "../lib/supabase";

function normalizeText(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

function extractLeetCodeSlug(url: string) {
	try {
		const parsed = new URL(url);
		const match = parsed.pathname.match(/\/problems\/([^/]+)/);
		return match?.[1] || null;
	} catch {
		return null;
	}
}

export function SettingsPage() {
	const { user, loading, updateLeetCodeUsername, signOut } = useAuth();
	const [leetcodeUsername, setLeetcodeUsername] = useState("");
	const [saving, setSaving] = useState(false);
	const [syncing, setSyncing] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		if (!user) return;
		setLeetcodeUsername(user.leetcodeUsername || user.username);
	}, [user]);

	if (!loading && !user) {
		return <Navigate to="/login" replace />;
	}

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		try {
			setSaving(true);
			setError("");
			setSuccess("");
			await updateLeetCodeUsername(leetcodeUsername);
			setSuccess("Settings saved.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save settings");
		} finally {
			setSaving(false);
		}
	}

	async function onSync() {
		if (!user) return;

		try {
			setSyncing(true);
			setError("");
			setSuccess("");

			const cleanLeetCodeUsername = leetcodeUsername.trim();
			if (!cleanLeetCodeUsername) {
				throw new Error("LeetCode username is required");
			}

			if (!supabase) {
				throw new Error(
					`Supabase is not configured. ${supabaseConfigError}`,
				);
			}

			if (
				cleanLeetCodeUsername !==
				(user.leetcodeUsername || user.username)
			) {
				await updateLeetCodeUsername(cleanLeetCodeUsername);
			}

			const { submissions, mode, publicSolvedCount } =
				await fetchAcceptedSubmissions(
					cleanLeetCodeUsername,
					5000,
				);

			const referencesBySlug = new Map<
				string,
				Array<{ setSlug: string; problemSlug: string }>
			>();
			const referencesByTitle = new Map<
				string,
				Array<{ setSlug: string; problemSlug: string }>
			>();

			for (const set of problemSets) {
				for (const topic of set.topics) {
					for (const problem of topic.problems) {
						if (!problem.url.includes("leetcode.com/problems/")) continue;

						const reference = {
							setSlug: set.slug,
							problemSlug: problem.slug,
						};

						for (const slugKey of [
							problem.slug,
							extractLeetCodeSlug(problem.url),
						]) {
							if (!slugKey) continue;
							if (!referencesBySlug.has(slugKey)) {
								referencesBySlug.set(slugKey, []);
							}
							referencesBySlug.get(slugKey)?.push(reference);
						}

						const titleKey = normalizeText(problem.name);
						if (!referencesByTitle.has(titleKey)) {
							referencesByTitle.set(titleKey, []);
						}
						referencesByTitle.get(titleKey)?.push(reference);
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

			const uniquePairs = new Set<string>();
			for (const item of submissions) {
				const refs = [
					...(item.titleSlug ? referencesBySlug.get(item.titleSlug) || [] : []),
					...(item.title
						? referencesByTitle.get(normalizeText(item.title)) || []
						: []),
				];

				if (!refs.length) continue;

				for (const ref of refs) {
					const pairKey = `${ref.setSlug}:${ref.problemSlug}`;
					if (uniquePairs.has(pairKey)) continue;
					uniquePairs.add(pairKey);
					solvedRows.push({
						id: crypto.randomUUID(),
						userId: user.id,
						setSlug: ref.setSlug,
						problemSlug: ref.problemSlug,
						solved: true,
						solvedAt: new Date().toISOString(),
					});
				}
			}

			if (!solvedRows.length) {
				setSuccess("Sync completed. No matching problems found in your sets.");
				return;
			}

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

			const solvedCountHint =
				publicSolvedCount === null
					? "Public solved count was unavailable."
					: `Public solved count on LeetCode profile: ${publicSolvedCount}.`;

			setSuccess(
				`Public sync complete. Matched ${solvedRows.length} problems from ${submissions.length} recent accepted submissions fetched (LeetCode public endpoint max is 20). ${solvedCountHint}`,
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sync progress");
		} finally {
			setSyncing(false);
		}
	}

	return (
		<div className="app-shell">
			<AppHeader />
			<section className="card">
				<h1 style={{ marginTop: 0 }}>Settings</h1>
				<p style={{ color: "var(--muted)" }}>
					Manage account actions and sync preferences.
				</p>

				<div className="card" style={{ marginTop: 16 }}>
					<h2 style={{ marginTop: 0, marginBottom: 8 }}>LeetCode Sync</h2>
					<p style={{ color: "var(--muted)", marginTop: 0 }}>
						Set your LeetCode username for public progress sync. LeetCode's
						public endpoint exposes recent accepted submissions only (max 20).
					</p>

					<form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
						<div style={{ display: "grid", gap: 6 }}>
							<label htmlFor="leetcode-username">LeetCode username</label>
							<input
								id="leetcode-username"
								value={leetcodeUsername}
								onChange={(e) =>
									setLeetcodeUsername(e.target.value)
								}
								disabled={saving}
								placeholder={
									user?.username || "your-leetcode-username"
								}
							/>
						</div>

						{error && <div style={{ color: "crimson" }}>{error}</div>}
						{success && <div style={{ color: "green" }}>{success}</div>}

						<div className="settings-actions">
							<button
								type="submit"
								className="primary"
								disabled={saving || syncing}
							>
								{saving ? "Saving..." : "Save"}
							</button>
							<button
								type="button"
								onClick={onSync}
								disabled={saving || syncing}
							>
								{syncing ? "Syncing..." : "Sync now"}
							</button>
						</div>
					</form>
				</div>

				<div className="card" style={{ marginTop: 16 }}>
					<h2 style={{ marginTop: 0, marginBottom: 8 }}>Account</h2>
					<button type="button" onClick={() => signOut()}>
						Sign out
					</button>
				</div>
			</section>
		</div>
	);
}
