import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

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
const byCode = new Map(problems.map((problem) => [problem.code, problem]));
const essentialsCodes = essentials.topics.flatMap(
	(topic) => topic.problemCodes,
);

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
				assert.match(url.pathname, /^\/problems\/[^/]+\/\d+\/?$/, code);
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
		"javascript:alert(1)",
		"not a URL",
	]) {
		assert.deepEqual(problemPlatformLinks({ url, gfgUrl: url }), [], url);
	}
});
