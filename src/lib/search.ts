import type { ProblemSet } from "../types/problems";

export type SearchResult = {
	id: string;
	title: string;
	subtitle: string;
	href: string;
	kind: "page" | "collection" | "guide" | "problem";
	external: boolean;
};

type SearchEntry = SearchResult & {
	titleText: string;
	keywords: string;
};

const normalize = (value: string) =>
	value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();

export const createSearchIndex = (sets: ProblemSet[]): SearchEntry[] => {
	const entries: SearchEntry[] = [];
	const add = (result: SearchResult, keywords: string) => {
		const entry = {
			...result,
			titleText: normalize(result.title),
			keywords: normalize(keywords),
		};
		entries.push(entry);
		return entry;
	};

	for (const [title, href, keywords] of [
		["Dashboard", "/", "home progress collections"],
		["Leaderboard", "/leaderboard", "rank rankings scores standings"],
		["Settings", "/settings", "account profile preferences theme"],
	]) {
		add(
			{
				id: `page:${href}`,
				title,
				subtitle: "Navigation",
				href,
				kind: "page",
				external: false,
			},
			keywords,
		);
	}

	const problems = new Map<string, SearchEntry>();
	for (const set of sets) {
		add(
			{
				id: `collection:${set.slug}`,
				title: set.title,
				subtitle: `${set.topics.reduce((total, topic) => total + topic.problems.length, 0)} topics and problems`,
				href: `/sets/${encodeURIComponent(set.slug)}`,
				kind: "collection",
				external: false,
			},
			`${set.slug} ${set.description} ${set.topics.map((topic) => topic.name).join(" ")}`,
		);
		for (const topic of set.topics) {
			for (const problem of topic.problems) {
				const context = `${set.title} ${set.slug} ${topic.name}`;
				const existing = problems.get(problem.code);
				if (existing) {
					existing.keywords += ` ${normalize(context)}`;
					continue;
				}
				const guide = problem.studyGuide;
				const hostname = new URL(problem.url).hostname.replace(
					/^www\./,
					"",
				);
				const guideKeywords = guide
					? `${guide.summary} ${guide.prerequisites.join(" ")} ${guide.decisions.map((decision) => decision.topic).join(" ")} ${guide.resources.map((resource) => resource.title).join(" ")}`
					: "";
				const entry = add(
					{
						id: `problem:${problem.code}`,
						title: problem.name,
						subtitle: guide
							? `${topic.name} / HLD guide`
							: `${topic.name} / ${hostname}`,
						href: guide
							? `/sets/${encodeURIComponent(set.slug)}?guide=${encodeURIComponent(problem.code)}&section=guide`
							: problem.url,
						kind: guide ? "guide" : "problem",
						external: !guide,
					},
					`${context} ${problem.code} ${problem.url} ${guideKeywords}`,
				);
				problems.set(problem.code, entry);
			}
		}
	}
	return entries;
};

export const searchCatalog = (
	index: SearchEntry[],
	query: string,
	limit = 20,
): SearchResult[] => {
	const normalized = normalize(query);
	const count = Math.max(0, limit);
	if (!normalized) {
		return index
			.filter(
				(entry) => entry.kind === "page" || entry.kind === "collection",
			)
			.slice(0, count);
	}
	const terms = normalized.split(" ");
	return index
		.filter((entry) =>
			terms.every(
				(term) =>
					entry.titleText.includes(term) ||
					entry.keywords.includes(term),
			),
		)
		.map((entry) => {
			const titleTerms = terms.filter((term) =>
				entry.titleText.includes(term),
			);
			const titlePhrase = titleTerms.join(" ");
			const titles =
				entry.kind === "guide"
					? [entry.titleText, entry.titleText.replace(/^design /, "")]
					: [entry.titleText];
			return {
				entry,
				score: titles.includes(normalized)
					? 100
					: titles.some((title) => title.startsWith(normalized))
						? 90
						: titles.some((title) => title.includes(normalized))
							? 80
							: titleTerms.length === terms.length
								? 60
								: 10 +
									5 * titleTerms.length +
									(titlePhrase &&
									entry.titleText.includes(titlePhrase)
										? 2
										: 0),
			};
		})
		.sort(
			(left, right) =>
				right.score - left.score ||
				left.entry.title.localeCompare(right.entry.title),
		)
		.slice(0, count)
		.map(({ entry }) => entry);
};
