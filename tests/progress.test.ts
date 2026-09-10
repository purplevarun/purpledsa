import assert from "node:assert/strict";
import test from "node:test";

import { countUniqueSolvedByUser } from "../src/lib/progress.ts";

test("41 legacy and global progress rows count as 19 unique solves", () => {
	const problems = Array.from(
		{ length: 19 },
		(unusedValue, index) => `problem-${index + 1}`,
	);
	const rows = [
		...problems.map((problemSlug) => ({
			problemSlug,
			setSlug: "neetcode-150",
		})),
		...problems.map((problemSlug) => ({ problemSlug, setSlug: "global" })),
		...problems
			.slice(0, 2)
			.map((problemSlug) => ({ problemSlug, setSlug: "blind-75" })),
		{ problemSlug: problems[2], setSlug: "striver-450" },
	].map((row) => ({ ...row, userId: "test-user", solved: true }));

	assert.equal(rows.length, 41);
	assert.equal(countUniqueSolvedByUser(rows).get("test-user"), 19);
	assert.equal(
		countUniqueSolvedByUser([...rows, ...rows]).get("test-user"),
		19,
	);
});

test("counts users independently and ignores unsolved rows", () => {
	const counts = countUniqueSolvedByUser([
		{ userId: "first", problemSlug: "two-sum", solved: true },
		{ userId: "first", problemSlug: "two-sum", solved: false },
		{ userId: "first", problemSlug: "lru-cache", solved: true },
		{ userId: "first", problemSlug: "course-schedule", solved: false },
		{ userId: "second", problemSlug: "two-sum", solved: true },
		{ userId: "second", problemSlug: "two-sum", solved: true },
		{ userId: "unsolved-only", problemSlug: "two-sum", solved: false },
	]);

	assert.deepEqual(
		counts,
		new Map([
			["first", 2],
			["second", 1],
		]),
	);
});

test("retains older and manual solves without requiring a global row", () => {
	const rows = [
		{
			userId: "test-user",
			problemSlug: "older-solve",
			setSlug: "neetcode-150",
			solved: true,
		},
		{
			userId: "test-user",
			problemSlug: "manual-solve",
			setSlug: "free-dsa-essentials",
			solved: true,
		},
		{
			userId: "test-user",
			problemSlug: "recent-solve",
			setSlug: "global",
			solved: true,
		},
	];

	assert.equal(countUniqueSolvedByUser(rows).get("test-user"), 3);
	assert.deepEqual(countUniqueSolvedByUser([]), new Map());
});
