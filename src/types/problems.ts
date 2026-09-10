export type Difficulty = "E" | "M" | "H";

export interface Problem {
	id: string;
	code: string;
	order: number;
	slug: string;
	name: string;
	difficulty: Difficulty;
	url: string;
	locked: boolean;
	hints: string[];
	gfgUrl?: string;
}

export interface ProblemTopic {
	name: string;
	problems: Problem[];
}

export interface ProblemSet {
	slug: string;
	title: string;
	description: string;
	topics: ProblemTopic[];
}
