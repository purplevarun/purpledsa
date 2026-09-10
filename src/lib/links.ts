export const practicePlatforms = [
	{
		id: "leetcode",
		label: "LeetCode",
		name: "LeetCode",
		url: "https://leetcode.com/problemset/",
		hostname: "leetcode.com",
		path: /^\/problems\/[^/]+\/?$/,
		focus: "Interview patterns",
	},
	{
		id: "neetcode",
		label: "NeetCode",
		name: "NeetCode",
		url: "https://neetcode.io/practice",
		hostname: "neetcode.io",
		path: /^\/problems\/[^/]+(?:\/question)?\/?$/,
		focus: "Free interview practice",
	},
	{
		id: "gfg",
		label: "GFG",
		name: "GeeksforGeeks",
		url: "https://www.geeksforgeeks.org/explore",
		hostname: "geeksforgeeks.org",
		path: /^\/problems\/[^/]+\/\d+\/?$/,
		focus: "Core data structures and algorithms",
	},
	{
		id: "spoj",
		label: "SPOJ",
		name: "SPOJ",
		url: "https://www.spoj.com/problems/classical/",
		hostname: "spoj.com",
		path: /^\/problems\/[A-Z0-9_]+\/?$/,
		focus: "Classic algorithm challenges",
	},
	{
		id: "codechef",
		label: "CodeChef",
		name: "CodeChef",
		url: "https://www.codechef.com/practice",
		hostname: "codechef.com",
		path: /^\/problems\/[A-Z0-9_]+\/?$/,
		focus: "Implementation and number theory",
	},
	{
		id: "codeforces",
		label: "Codeforces",
		name: "Codeforces",
		url: "https://codeforces.com/problemset",
		hostname: "codeforces.com",
		path: /^\/problemset\/problem\/\d+\/[A-Z]\d?\/?$/,
		focus: "Greedy reasoning and contest patterns",
	},
	{
		id: "cses",
		label: "CSES",
		name: "CSES",
		url: "https://cses.fi/problemset/",
		hostname: "cses.fi",
		path: /^\/problemset\/task\/\d+\/?$/,
		focus: "Graphs, dynamic programming, and range queries",
	},
];

export const getPracticePlatform = (value: string) => {
	try {
		const url = new URL(value);
		if (url.protocol !== "https:") return undefined;
		const hostname = url.hostname.replace(/^www\./, "");
		return practicePlatforms.find(
			(platform) =>
				platform.hostname === hostname &&
				platform.path.test(url.pathname),
		);
	} catch {
		return undefined;
	}
};

const systemDesignWebsites = [
	{
		label: "Hello Interview",
		hostname: "hellointerview.com",
		path: /^\/learn\/(?:system-design|ml-system-design)\/(?:problem-breakdowns|deep-dives)\/[a-z0-9-]+\/?$/,
	},
	{
		label: "GFG",
		hostname: "geeksforgeeks.org",
		path: /^\/system-design\/[a-z0-9-]+\/?$/,
	},
	{
		label: "Stripe",
		hostname: "stripe.dev",
		path: /^\/blog\/payment-api-design\/?$/,
	},
];

const getSystemDesignWebsite = (value: string) => {
	try {
		const url = new URL(value);
		if (url.protocol !== "https:" || url.search) return undefined;
		const hostname = url.hostname.replace(/^www\./, "");
		return systemDesignWebsites.find(
			(website) =>
				website.hostname === hostname && website.path.test(url.pathname),
		);
	} catch {
		return undefined;
	}
};

export const problemPlatformLinks = (problem: {
	url: string;
	gfgUrl?: string;
}): Array<{ label: string; url: string }> => {
	const links: Array<{ label: string; url: string }> = [];
	for (const value of new Set([problem.gfgUrl, problem.url])) {
		if (!value) continue;
		const label =
			getPracticePlatform(value)?.label ??
			getSystemDesignWebsite(value)?.label;
		if (label && !links.some((link) => link.label === label)) {
			links.push({ label, url: value });
		}
	}
	return links;
};

// LLD/machine-coding problems have no canonical problem page, so link to a
// real GitHub code search instead of guessing a specific repo.
export const githubSearchUrl = (query: string): string => {
	return `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`;
};
