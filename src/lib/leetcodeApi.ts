type LeetCodeSubmission = {
	title?: string;
	titleSlug?: string;
	statusDisplay?: string;
	timestamp?: string;
	lang?: string;
};

type FetchAcceptedSubmissionsResult = {
	submissions: LeetCodeSubmission[];
	mode: "recent";
	publicSolvedCount: number | null;
};

type GraphQLResponse<T> = {
	data?: T;
	errors?: Array<{ message?: string }>;
};

const LEETCODE_GRAPHQL_ENDPOINT = "/api/leetcode";

const RECENT_AC_SUBMISSION_QUERY = `
	query getACSubmissions($username: String!, $limit: Int) {
		recentAcSubmissionList(username: $username, limit: $limit) {
			title
			titleSlug
			timestamp
			statusDisplay
			lang
		}
	}
`;

const RECENT_SUBMISSION_QUERY = `
	query getRecentSubmissions($username: String!, $limit: Int) {
		recentSubmissionList(username: $username, limit: $limit) {
			title
			titleSlug
			timestamp
			statusDisplay
			lang
		}
	}
`;

const PUBLIC_SOLVED_COUNT_QUERY = `
	query getPublicSolvedCount($username: String!) {
		matchedUser(username: $username) {
			submitStatsGlobal {
				acSubmissionNum {
					difficulty
					count
				}
			}
		}
	}
`;

const requestLeetCodeGraphQL = async <T>(
	query: string,
	variables: Record<string, unknown>,
): Promise<T> => {
	const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query, variables }),
	});

	const payload = (await response.json()) as GraphQLResponse<T>;

	if (!response.ok) {
		throw new Error(
			payload.errors?.[0]?.message ||
				`LeetCode request failed with status ${response.status}`,
		);
	}
	if (payload.errors?.length) {
		throw new Error(
			payload.errors[0]?.message || "LeetCode GraphQL request failed",
		);
	}
	if (!payload.data) {
		throw new Error("LeetCode returned an empty response");
	}

	return payload.data;
};

export const fetchAcceptedSubmissions = async (
	username: string,
	limit = 5000,
): Promise<FetchAcceptedSubmissionsResult> => {
	const publicLimit = Math.min(Math.max(limit, 1), 20);

	const [acResult, allResult, statsResult] = await Promise.allSettled([
		requestLeetCodeGraphQL<{
			recentAcSubmissionList?: LeetCodeSubmission[];
		}>(RECENT_AC_SUBMISSION_QUERY, { username, limit: publicLimit }),
		requestLeetCodeGraphQL<{
			recentSubmissionList?: LeetCodeSubmission[];
		}>(RECENT_SUBMISSION_QUERY, { username, limit: publicLimit }),
		requestLeetCodeGraphQL<{
			matchedUser?: {
				submitStatsGlobal?: {
					acSubmissionNum?: Array<{
						difficulty?: string;
						count?: number;
					}>;
				};
			};
		}>(PUBLIC_SOLVED_COUNT_QUERY, { username }),
	]);

	const acSubmissions =
		acResult.status === "fulfilled"
			? (acResult.value.recentAcSubmissionList ?? [])
			: [];

	const acceptedFromAll =
		allResult.status === "fulfilled"
			? (allResult.value.recentSubmissionList ?? []).filter((item) =>
					(item.statusDisplay || "")
						.toLowerCase()
						.includes("accepted"),
				)
			: [];

	if (!acSubmissions.length && !acceptedFromAll.length) {
		if (acResult.status === "rejected" && allResult.status === "rejected") {
			throw new Error(
				"Could not fetch LeetCode submissions. If this persists, LeetCode may be blocking browser-origin requests from this environment.",
			);
		}
	}

	const deduped: LeetCodeSubmission[] = [];
	const seen = new Set<string>();
	for (const item of [...acSubmissions, ...acceptedFromAll]) {
		const key = `${item.titleSlug || ""}|${item.title || ""}`;
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(item);
	}

	let publicSolvedCount: number | null = null;
	if (statsResult.status === "fulfilled") {
		const counts =
			statsResult.value.matchedUser?.submitStatsGlobal?.acSubmissionNum ||
			[];
		const total = counts.find((item) => item.difficulty === "All")?.count;
		if (typeof total === "number") {
			publicSolvedCount = total;
		}
	}

	return {
		submissions: deduped,
		mode: "recent",
		publicSolvedCount,
	};
};

export type { LeetCodeSubmission };
