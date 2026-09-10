export type ProgressRow = {
	userId: string;
	problemSlug: string;
	solved: boolean;
};

export const countUniqueSolvedByUser = (
	rows: readonly ProgressRow[],
): Map<string, number> => {
	const solvedByUser = new Map<string, Set<string>>();
	for (const row of rows) {
		if (!row.solved) continue;
		let solvedProblems = solvedByUser.get(row.userId);
		if (!solvedProblems) {
			solvedProblems = new Set<string>();
			solvedByUser.set(row.userId, solvedProblems);
		}
		solvedProblems.add(row.problemSlug);
	}

	return new Map(
		Array.from(solvedByUser, ([userId, problems]) => [
			userId,
			problems.size,
		]),
	);
};
