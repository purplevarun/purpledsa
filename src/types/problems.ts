export type Difficulty = "E" | "M" | "H";

export interface StudyGuide {
	summary: string;
	reviewedAt: string;
	prerequisites: string[];
	requirements: {
		functional: string[];
		nonFunctional: string[];
		outOfScope: string[];
	};
	capacity: {
		assumptions: string[];
		estimates: Array<{
			label: string;
			calculation: string;
			implication: string;
		}>;
	};
	api: Array<{ signature: string; purpose: string }>;
	dataModel: Array<{ entity: string; fields: string; notes: string }>;
	architecture: {
		diagram: string;
		flows: Array<{ name: string; steps: string[] }>;
	};
	decisions: Array<{ topic: string; choice: string; tradeOff: string }>;
	failureModes: Array<{ scenario: string; handling: string }>;
	selfCheck: Array<{ question: string; answer: string }>;
	resources: Array<{
		kind: "article" | "video";
		title: string;
		author: string;
		url: string;
		why: string;
	}>;
}

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
	studyGuide?: StudyGuide;
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
