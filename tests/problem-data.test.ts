import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import type { ProblemSet, StudyGuide } from "../src/types/problems.ts";
import { createSearchIndex, searchCatalog } from "../src/lib/search.ts";

import {
	getPracticePlatform,
	practicePlatforms,
	problemPlatformLinks,
} from "../src/lib/links.ts";

type ProblemRecord = {
	id: string;
	code: string;
	name: string;
	url: string;
	locked: boolean;
	gfgUrl?: string;
};

type SheetReference = {
	slug: string;
	title: string;
	access?: string;
	topics: Array<{ name: string; problemCodes: string[] }>;
	guides?: Record<string, StudyGuide>;
};

const problems: ProblemRecord[] = JSON.parse(
	readFileSync(
		new URL("../src/data/dsa_problems.json", import.meta.url),
		"utf8",
	),
);
const essentials: SheetReference = JSON.parse(
	readFileSync(
		new URL(
			"../src/data/problem_sets/free-dsa-essentials.json",
			import.meta.url,
		),
		"utf8",
	),
);
const hld: SheetReference = JSON.parse(
	readFileSync(
		new URL("../src/data/problem_sets/hld.json", import.meta.url),
		"utf8",
	),
);
const hldCodes = hld.topics.flatMap((topic) => topic.problemCodes);
const byCode = new Map(problems.map((problem) => [problem.code, problem]));
const essentialsCodes = essentials.topics.flatMap(
	(topic) => topic.problemCodes,
);

test("HLD entries use direct system-design resources with website labels", () => {
	const resources: Array<[string, string, string]> = [
		[
			"design-url-shortener",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly",
		],
		[
			"design-rate-limiter-at-scale",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter",
		],
		[
			"design-distributed-cache",
			"GFG",
			"https://www.geeksforgeeks.org/system-design/design-distributed-cache-system-design/",
		],
		[
			"design-api-gateway",
			"GFG",
			"https://www.geeksforgeeks.org/system-design/what-is-api-gateway-system-design/",
		],
		[
			"design-real-time-chat",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/problem-breakdowns/whatsapp",
		],
		[
			"design-notification-system",
			"GFG",
			"https://www.geeksforgeeks.org/system-design/design-notification-services-system-design/",
		],
		[
			"design-pub-sub-messaging-platform",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/deep-dives/kafka",
		],
		[
			"design-search-autocomplete",
			"GFG",
			"https://www.geeksforgeeks.org/system-design/googles-search-autocomplete-high-level-designhld/",
		],
		[
			"design-news-feed",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed",
		],
		[
			"design-recommendation-system",
			"Hello Interview",
			"https://www.hellointerview.com/learn/ml-system-design/problem-breakdowns/video-recommendations",
		],
		[
			"design-analytics-event-pipeline",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/problem-breakdowns/ad-click-aggregator",
		],
		[
			"design-ride-sharing-platform",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/problem-breakdowns/uber",
		],
		[
			"design-food-delivery-platform",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/problem-breakdowns/gopuff",
		],
		[
			"design-video-streaming-platform",
			"Hello Interview",
			"https://www.hellointerview.com/learn/system-design/problem-breakdowns/youtube",
		],
		[
			"design-payment-system",
			"Stripe",
			"https://stripe.dev/blog/payment-api-design",
		],
	];
	assert.equal(hldCodes.length, 15);
	assert.deepEqual(
		hldCodes,
		resources.map(([code]) => code),
	);
	const urls = new Set<string>();
	for (const [code, label, expectedUrl] of resources) {
		const problem = byCode.get(code);
		assert.ok(problem, code);
		assert.equal(problem.url, expectedUrl, code);
		const url = new URL(problem.url);
		assert.equal(url.protocol, "https:", code);
		assert.equal(url.search, "", code);
		assert.notEqual(url.pathname, "/", code);
		assert.doesNotMatch(url.pathname, /\/(search|problemset)\/?$/i, code);
		assert.equal(getPracticePlatform(problem.url), undefined, code);
		assert.deepEqual(
			problemPlatformLinks(problem),
			[{ label, url: expectedUrl }],
			code,
		);
		urls.add(problem.url);
	}
	assert.equal(urls.size, hldCodes.length);
});

test("every HLD topic has a complete illustrated study guide and direct resources", () => {
	assert.ok(hld.guides, "HLD study guides are missing");
	assert.deepEqual(Object.keys(hld.guides).sort(), [...hldCodes].sort());
});

for (const code of hldCodes) {
	test(`HLD study guide: ${code}`, () => {
		const guide = hld.guides?.[code];
		assert.ok(guide, `${code}: guide is missing`);
		assert.ok(guide.summary.length >= 100, `${code}: summary`);
		assert.match(guide.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, code);
		assert.ok(guide.prerequisites.length >= 2, `${code}: prerequisites`);
		assert.ok(
			guide.requirements.functional.length >= 3,
			`${code}: functional requirements`,
		);
		assert.ok(
			guide.requirements.nonFunctional.length >= 3,
			`${code}: quality requirements`,
		);
		assert.ok(guide.requirements.outOfScope.length >= 1, `${code}: scope`);
		assert.ok(
			guide.capacity.assumptions.length >= 2,
			`${code}: sizing assumptions`,
		);
		assert.ok(guide.capacity.estimates.length >= 2, `${code}: estimates`);
		assert.ok(guide.api.length >= 2, `${code}: API`);
		assert.ok(guide.dataModel.length >= 2, `${code}: data model`);
		assert.match(
			guide.architecture.diagram,
			/^flowchart (TD|LR)\n/,
			`${code}: diagram`,
		);
		assert.doesNotMatch(
			guide.architecture.diagram,
			/%%\{|\bclick\b|<script/i,
			code,
		);
		assert.ok(
			guide.architecture.flows.length >= 2,
			`${code}: request flows`,
		);
		for (const flow of guide.architecture.flows) {
			assert.ok(
				flow.name && flow.steps.length >= 3,
				`${code}: ${flow.name}`,
			);
		}
		assert.ok(guide.decisions.length >= 3, `${code}: trade-offs`);
		assert.ok(guide.failureModes.length >= 3, `${code}: failure handling`);
		assert.ok(guide.selfCheck.length >= 3, `${code}: self-check`);
		for (const check of guide.selfCheck) {
			assert.ok(
				check.question && check.answer.length >= 80,
				`${code}: ${check.question}`,
			);
		}
		assert.ok(
			guide.resources.filter((resource) => resource.kind === "article")
				.length >= 2,
			`${code}: readings`,
		);
		assert.ok(
			guide.resources.some((resource) => resource.kind === "video"),
			`${code}: video`,
		);
		assert.ok(
			guide.resources.some(
				(resource) => resource.url === byCode.get(code)?.url,
			),
			`${code}: primary reading`,
		);
		assert.equal(
			new Set(guide.resources.map((resource) => resource.url)).size,
			guide.resources.length,
			`${code}: duplicate resource`,
		);
		for (const resource of guide.resources) {
			assert.ok(
				resource.title && resource.author && resource.why,
				`${code}: resource context`,
			);
			const url = new URL(resource.url);
			assert.equal(url.protocol, "https:", code);
			assert.notEqual(url.pathname, "/", code);
			assert.doesNotMatch(url.pathname, /\/(search|results)\/?$/i, code);
			if (resource.kind === "video") {
				assert.equal(url.hostname, "www.youtube.com", code);
				assert.equal(url.pathname, "/watch", code);
				assert.match(
					url.searchParams.get("v") ?? "",
					/^[a-zA-Z0-9_-]{11}$/,
					code,
				);
				assert.equal(url.searchParams.size, 1, code);
			} else {
				assert.equal(url.search, "", code);
			}
		}
	});
}

test("HLD video selections retain their reviewed topic mappings", () => {
	const videoIds: Record<string, string> = {
		"design-url-shortener": "iUU4O1sWtJA",
		"design-rate-limiter-at-scale": "MIJFyUPG4Z4",
		"design-distributed-cache": "fmT5nlEkl3U",
		"design-api-gateway": "fyTxwIa-1U0",
		"design-real-time-chat": "cr6p0n0N-VA",
		"design-notification-system": "DU8o-OTeoCc",
		"design-pub-sub-messaging-platform": "DU8o-OTeoCc",
		"design-search-autocomplete": "PuZvF2EyfBM",
		"design-news-feed": "Qj4-GruzyDU",
		"design-recommendation-system": "jz0-satrmrA",
		"design-analytics-event-pipeline": "Zcv_899yqhI",
		"design-ride-sharing-platform": "lsKU38RKQSo",
		"design-food-delivery-platform": "lsKU38RKQSo",
		"design-video-streaming-platform": "IUrQ5_g3XKs",
		"design-payment-system": "GAe5oB742dw",
	};
	assert.deepEqual(Object.keys(videoIds), hldCodes);
	for (const [code, videoId] of Object.entries(videoIds)) {
		assert.deepEqual(
			hld.guides?.[code].resources
				.filter((resource) => resource.kind === "video")
				.map((resource) => resource.url),
			[`https://www.youtube.com/watch?v=${videoId}`],
			code,
		);
	}
});

const searchDirectory = new URL("../src/data/problem_sets/", import.meta.url);
const searchSets: ProblemSet[] = readdirSync(searchDirectory)
	.filter((filename) => filename.endsWith(".json"))
	.map((filename) => {
		const sheet: SheetReference = JSON.parse(
			readFileSync(new URL(filename, searchDirectory), "utf8"),
		);
		return {
			slug: sheet.slug,
			title: sheet.title,
			description: sheet.title,
			topics: sheet.topics.map((topic) => ({
				name: topic.name,
				problems: topic.problemCodes.map((code, order) => ({
					...byCode.get(code)!,
					order,
					slug: code,
					difficulty: "M" as const,
					hints: [],
					studyGuide: sheet.guides?.[code],
				})),
			})),
		};
	});
const searchIndex = createSearchIndex(searchSets);

test("global search indexes each problem once across collections", () => {
	const entries = searchIndex.filter(
		(entry) => entry.kind === "problem" || entry.kind === "guide",
	);
	assert.equal(entries.length, problems.length);
	assert.equal(
		new Set(entries.map((entry) => entry.id)).size,
		entries.length,
	);
	assert.equal(
		searchIndex.filter((entry) => entry.kind === "collection").length,
		searchSets.length,
	);
	assert.equal(entries.filter((entry) => entry.kind === "guide").length, 15);
});

test("global search prioritizes titles and finds topics and guide concepts", () => {
	assert.equal(searchCatalog(searchIndex, "  TWO-SUM  ")[0].title, "Two Sum");
	assert.equal(
		searchCatalog(searchIndex, "leetcode two sum")[0].href,
		"https://leetcode.com/problems/two-sum/",
	);
	const guide = searchCatalog(searchIndex, "URL shortener")[0];
	assert.equal(guide.kind, "guide");
	assert.equal(guide.external, false);
	assert.equal(
		guide.href,
		"/sets/hld?guide=design-url-shortener&section=guide",
	);
	assert.ok(
		searchCatalog(searchIndex, "Kafka").some(
			(entry) => entry.id === "problem:design-pub-sub-messaging-platform",
		),
	);
	assert.ok(
		searchCatalog(searchIndex, "binary tree").some(
			(entry) => entry.kind === "problem",
		),
	);
	assert.equal(
		searchCatalog(searchIndex, "leaderboard")[0].href,
		"/leaderboard",
	);
	assert.equal(
		searchCatalog(searchIndex, "neetcode 150")[0].href,
		"/sets/neetcode-150",
	);
});

test("global search handles empty queries, missing results, and result limits", () => {
	const defaults = searchCatalog(searchIndex, "   ");
	assert.ok(defaults.length);
	assert.ok(
		defaults.every(
			(entry) => entry.kind === "page" || entry.kind === "collection",
		),
	);
	assert.deepEqual(
		searchCatalog(searchIndex, "no-such-catalog-entry-12345"),
		[],
	);
	assert.equal(searchCatalog(searchIndex, "design", 3).length, 3);
	assert.deepEqual(searchCatalog(searchIndex, "design", 0), []);
	assert.deepEqual(searchCatalog(searchIndex, "design", -1), []);
	const problem = searchCatalog(searchIndex, "two sum")[0];
	assert.equal(problem.external, true);
	assert.equal(problem.href, byCode.get("two-sum")?.url);
});

test("Free DSA Essentials has 100 unique exercises across all seven platforms", () => {
	assert.equal(essentials.slug, "free-dsa-essentials");
	assert.equal(essentials.access, "free");
	assert.equal(essentialsCodes.length, 100);
	assert.equal(new Set(essentialsCodes).size, essentialsCodes.length);
	assert.equal(essentials.topics.length, 9);
	const counts: Record<string, number> = {};
	const urls = new Set<string>();
	for (const code of essentialsCodes) {
		const problem = byCode.get(code);
		assert.ok(problem, code);
		const platform = getPracticePlatform(problem.url);
		assert.ok(platform, code);
		counts[platform.id] = (counts[platform.id] || 0) + 1;
		urls.add(problem.url);
	}
	assert.equal(urls.size, essentialsCodes.length);
	assert.deepEqual(counts, {
		gfg: 15,
		codechef: 7,
		spoj: 11,
		codeforces: 10,
		cses: 10,
		leetcode: 42,
		neetcode: 5,
	});
	assert.deepEqual(
		Object.keys(counts).sort(),
		practicePlatforms.map((platform) => platform.id).sort(),
	);
});

test("the retired sheet is removed, including its registration", () => {
	assert.equal(
		existsSync(
			new URL(
				"../src/data/problem_sets/striver-450.json",
				import.meta.url,
			),
		),
		false,
	);
	const registration = readFileSync(
		new URL("../src/data/problemSets.ts", import.meta.url),
		"utf8",
	);
	assert.doesNotMatch(registration, /striver-450|striver450Raw/);
});

test("all active references resolve and the master index includes every coding set", () => {
	assert.equal(byCode.size, problems.length);
	assert.equal(
		new Set(problems.map((problem) => problem.id)).size,
		problems.length,
	);
	const directory = new URL("../src/data/problem_sets/", import.meta.url);
	const sheets: SheetReference[] = readdirSync(directory)
		.filter((filename) => filename.endsWith(".json"))
		.map((filename) =>
			JSON.parse(readFileSync(new URL(filename, directory), "utf8")),
		);
	for (const sheet of sheets) {
		for (const topic of sheet.topics) {
			for (const code of topic.problemCodes) {
				assert.ok(byCode.has(code), `${sheet.slug}: missing ${code}`);
			}
		}
	}
	const master = sheets.find((sheet) => sheet.slug === "all-dsa-questions");
	assert.ok(master);
	const masterCodes = new Set(
		master.topics.flatMap((topic) => topic.problemCodes),
	);
	for (const sheet of sheets.filter(
		(sheet) => !["lld", "hld"].includes(sheet.slug),
	)) {
		for (const code of sheet.topics.flatMap(
			(topic) => topic.problemCodes,
		)) {
			assert.ok(masterCodes.has(code), code);
		}
	}
	for (const code of masterCodes)
		assert.ok(getPracticePlatform(byCode.get(code)!.url), code);
	assert.equal(byCode.has("r"), false);
	assert.equal(byCode.has("deletion-of-the"), false);
});

test("active data contains no paid entries or TUF links", () => {
	for (const problem of problems) {
		const code = problem.code;
		assert.equal(problem.locked, false, code);
		assert.equal(problem.name, problem.name.trim(), code);
		assert.ok(problem.name.length > 2, code);
		assert.doesNotMatch(
			problem.name,
			/^(R|Pre|Pow|Cpp|Hard|Theory With Examples|Easy And Medium|Deletion Of The)$/i,
			code,
		);
		for (const value of [problem.url, problem.gfgUrl].filter(Boolean)) {
			const url = new URL(value!);
			assert.equal(url.protocol, "https:", code);
			assert.equal(
				url.hostname.endsWith("takeuforward.org"),
				false,
				code,
			);
			assert.equal(url.searchParams.has("s"), false, code);
			if (url.hostname.endsWith("geeksforgeeks.org")) {
				assert.equal(url.hostname, "www.geeksforgeeks.org", code);
				assert.match(
					url.pathname,
					hldCodes.includes(code)
						? /^\/system-design\/[a-z0-9-]+\/$/
						: /^\/problems\/[^/]+\/\d+\/?$/,
					code,
				);
			}
		}
		if (problem.gfgUrl) {
			assert.equal(
				new URL(problem.gfgUrl).hostname,
				"www.geeksforgeeks.org",
				code,
			);
		}
	}
});

test("similarly named tasks retain their actual problem identities", () => {
	const expected: Array<[string, string, string]> = [
		[
			"frog-jump",
			"Frog Jump",
			"https://www.geeksforgeeks.org/problems/geek-jump/1",
		],
		[
			"house-robber",
			"House Robber",
			"https://leetcode.com/problems/house-robber/",
		],
		[
			"house-robber-ii",
			"House Robber II",
			"https://leetcode.com/problems/house-robber-ii/",
		],
		[
			"coin-change-ii",
			"Coin Change II",
			"https://leetcode.com/problems/coin-change-ii/",
		],
	];
	for (const [code, name, url] of expected) {
		assert.ok(essentialsCodes.includes(code), code);
		const problem = byCode.get(code);
		assert.ok(problem, code);
		assert.equal(problem.name, name, code);
		assert.equal(problem.url, url, code);
	}
	assert.equal(byCode.get("largest-element")?.id, "striver-largest-element");
	assert.equal(byCode.get("house-robber")?.id, "dsa-0101");
});

test("premium LeetCode problems use their free NeetCode equivalents", () => {
	for (const [code, slug] of [
		["encode-and-decode-strings", "string-encode-and-decode"],
		["walls-and-gates", "islands-and-treasure"],
		["alien-dictionary", "foreign-dictionary"],
		["meeting-rooms", "meeting-schedule"],
		["meeting-rooms-ii", "meeting-schedule-ii"],
		["meeting-rooms-ii-2", "meeting-schedule-ii"],
		["graph-valid-tree", "valid-tree"],
		[
			"number-of-connected-components-in-an-undirected-graph",
			"count-connected-components",
		],
	]) {
		const problem = byCode.get(code);
		assert.ok(problem, code);
		assert.equal(problem.url, `https://neetcode.io/problems/${slug}`, code);
		assert.equal(problem.locked, false, code);
	}
});

test("the largest-element entry uses the exact GFG practice URL", () => {
	assert.ok(essentialsCodes.includes("largest-element"));

	const problem = problems.find(
		(entry: { code: string }) => entry.code === "largest-element",
	);
	assert.ok(problem);
	assert.match(problem.name, /largest.*array/i);
	assert.equal(
		problem.url,
		"https://www.geeksforgeeks.org/problems/largest-element-in-array4009/1",
	);
	assert.equal(problem.gfgUrl, problem.url);
});

test("platform buttons use exact supplied practice links and matching labels", () => {
	const gfgUrl =
		"https://www.geeksforgeeks.org/problems/largest-element-in-array4009/1";
	assert.deepEqual(problemPlatformLinks({ url: gfgUrl, gfgUrl }), [
		{ label: "GFG", url: gfgUrl },
	]);

	const leetcodeUrl = "https://leetcode.com/problems/two-sum/";
	const twoSumGfgUrl =
		"https://www.geeksforgeeks.org/problems/key-pair5616/1";
	assert.deepEqual(
		problemPlatformLinks({ url: leetcodeUrl, gfgUrl: twoSumGfgUrl }),
		[
			{ label: "GFG", url: twoSumGfgUrl },
			{ label: "LeetCode", url: leetcodeUrl },
		],
	);
	assert.deepEqual(problemPlatformLinks({ url: leetcodeUrl }), [
		{ label: "LeetCode", url: leetcodeUrl },
	]);

	const neetcodeUrl = "https://neetcode.io/problems/two-integer-sum";
	assert.deepEqual(problemPlatformLinks({ url: neetcodeUrl }), [
		{ label: "NeetCode", url: neetcodeUrl },
	]);

	for (const [label, url] of [
		["SPOJ", "https://www.spoj.com/problems/AGGRCOW/"],
		["CodeChef", "https://www.codechef.com/problems/TSORT"],
		["Codeforces", "https://codeforces.com/problemset/problem/580/C"],
		["CSES", "https://cses.fi/problemset/task/1192/"],
	]) {
		assert.deepEqual(problemPlatformLinks({ url }), [{ label, url }]);
	}
});

test("platform buttons never use searches, invented destinations, or unrelated hosts", () => {
	for (const url of [
		"https://www.geeksforgeeks.org/?s=Largest%20Element",
		"https://www.geeksforgeeks.org/problems/",
		"https://leetcode.com/problemset/",
		"https://leetcode.com.example.org/problems/two-sum/",
		"https://takeuforward.org/plus/dsa/problems/largest-element",
		"https://www.spoj.com/problems/classical/",
		"https://www.codechef.com/practice",
		"https://codeforces.com/problemset",
		"https://cses.fi/problemset/",
		"https://github.com/example/design-problem",
		"https://github.com/search?q=system-design&type=repositories",
		"https://www.hellointerview.com/learn/system-design",
		"https://www.hellointerview.com/learn/system-design/problem-breakdowns/",
		"https://www.hellointerview.com/premium",
		"https://www.hellointerview.com.example.org/learn/system-design/problem-breakdowns/bitly",
		"http://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly",
		"https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly?search=cache",
		"https://www.geeksforgeeks.org/system-design/",
		"https://www.geeksforgeeks.org/system-design/design-distributed-cache-system-design/?s=cache",
		"https://www.geeksforgeeks.org/courses/system-design-training-program",
		"https://stripe.dev/blog",
		"https://stripe.dev.example.org/blog/payment-api-design",
		"javascript:alert(1)",
		"not a URL",
	]) {
		assert.deepEqual(problemPlatformLinks({ url, gfgUrl: url }), [], url);
	}
});
