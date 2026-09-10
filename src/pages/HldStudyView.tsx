import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Check,
	CirclePlay,
	Download,
	ExternalLink,
	ListChecks,
	Maximize2,
	Search,
	Workflow,
	X,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { ProblemSet, StudyGuide } from "../types/problems";
import "./hld-study.css";

let diagramRenderer: Promise<(typeof import("mermaid"))["default"]> | undefined;

const getDiagramRenderer = () => {
	diagramRenderer ??= import("mermaid").then(({ default: mermaid }) => {
		mermaid.initialize({
			startOnLoad: false,
			securityLevel: "strict",
			htmlLabels: false,
			theme: "base",
			themeVariables: {
				fontFamily: "JetBrains Mono, monospace",
				fontSize: "14px",
				primaryColor: "#eef7f6",
				primaryTextColor: "#172523",
				primaryBorderColor: "#34756d",
				secondaryColor: "#eef3fa",
				tertiaryColor: "#f6f6f6",
				lineColor: "#55636d",
				edgeLabelBackground: "#ffffff",
			},
			flowchart: {
				htmlLabels: false,
				curve: "linear",
				useMaxWidth: true,
			},
		});
		return mermaid;
	});
	return diagramRenderer;
};

const StudyDiagram = ({ source, title }: { source: string; title: string }) => {
	const renderId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
	const dialog = useRef<HTMLDialogElement>(null);
	const [zoom, setZoom] = useState(100);
	const [result, setResult] = useState<{
		source: string;
		svg?: string;
		error?: string;
	}>({ source: "" });
	const svg = result.source === source ? result.svg : undefined;
	const error = result.source === source ? result.error : undefined;

	useEffect(() => {
		let canceled = false;
		const render = async () => {
			try {
				const mermaid = await getDiagramRenderer();
				if (canceled) return;
				const rendered = await mermaid.render(
					`hld-${renderId}`,
					source,
				);
				if (!canceled) setResult({ source, svg: rendered.svg });
			} catch {
				if (!canceled)
					setResult({
						source,
						error: "Diagram unavailable. The request flows below describe the same architecture.",
					});
			}
		};
		void render();
		return () => {
			canceled = true;
		};
	}, [source, renderId]);

	const download = () => {
		if (!svg) return;
		const url = URL.createObjectURL(
			new Blob([svg], { type: "image/svg+xml" }),
		);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-architecture.svg`;
		anchor.click();
		URL.revokeObjectURL(url);
	};

	return (
		<figure className="study-diagram">
			<div className="study-diagram-toolbar">
				<figcaption>Architecture</figcaption>
				<div className="study-diagram-controls">
					<button
						type="button"
						className="study-icon"
						aria-label="Zoom out"
						title="Zoom out"
						disabled={zoom <= 75 || !svg}
						onClick={() => setZoom(zoom - 25)}
					>
						<ZoomOut size={17} />
					</button>
					<output aria-label="Diagram zoom">{zoom}%</output>
					<button
						type="button"
						className="study-icon"
						aria-label="Zoom in"
						title="Zoom in"
						disabled={zoom >= 200 || !svg}
						onClick={() => setZoom(zoom + 25)}
					>
						<ZoomIn size={17} />
					</button>
					<button
						type="button"
						className="study-icon"
						aria-label="Download diagram"
						title="Download diagram as SVG"
						disabled={!svg}
						onClick={download}
					>
						<Download size={17} />
					</button>
					<button
						type="button"
						className="study-icon"
						aria-label="Expand diagram"
						title="Expand diagram"
						disabled={!svg}
						onClick={() => dialog.current?.showModal()}
					>
						<Maximize2 size={17} />
					</button>
				</div>
			</div>
			<div
				className="study-diagram-viewport"
				tabIndex={0}
				aria-label={`${title} diagram, scrollable`}
			>
				{svg ? (
					<div
						className="study-diagram-svg"
						role="img"
						aria-label={`${title} architecture`}
						style={{ width: `${zoom}%` }}
						dangerouslySetInnerHTML={{ __html: svg }}
					/>
				) : (
					<p role="status">{error ?? "Rendering architecture..."}</p>
				)}
			</div>
			<dialog
				className="study-diagram-dialog"
				ref={dialog}
				aria-label={`${title} expanded architecture`}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						dialog.current?.close();
					}
				}}
			>
				<div className="study-diagram-toolbar">
					<h3>{title}</h3>
					<button
						type="button"
						className="study-icon"
						aria-label="Close diagram"
						title="Close diagram"
						onClick={() => dialog.current?.close()}
					>
						<X size={20} />
					</button>
				</div>
				{svg && (
					<div className="study-expanded-viewport">
						<img
							className="study-expanded-svg"
							alt={`${title} expanded diagram`}
							src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
						/>
					</div>
				)}
			</dialog>
		</figure>
	);
};

const sections = [
	{ id: "guide", label: "Guide", icon: BookOpen },
	{ id: "architecture", label: "Architecture", icon: Workflow },
	{ id: "review", label: "Review", icon: ListChecks },
	{ id: "resources", label: "Resources", icon: CirclePlay },
] as const;

const GuideOverview = ({ guide }: { guide: StudyGuide }) => (
	<>
		<section className="study-section">
			<h3>Prerequisites</h3>
			<ul>
				{guide.prerequisites.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</section>
		<section className="study-section">
			<h3>Requirements</h3>
			<div className="study-requirements">
				<div>
					<h4>Functional</h4>
					<ul>
						{guide.requirements.functional.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</div>
				<div>
					<h4>Quality Targets</h4>
					<ul>
						{guide.requirements.nonFunctional.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</div>
			</div>
			<h4>Out of Scope</h4>
			<ul>
				{guide.requirements.outOfScope.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</section>
		<section className="study-section">
			<h3>Capacity &amp; Assumptions</h3>
			<ul>
				{guide.capacity.assumptions.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
			{guide.capacity.estimates.map((estimate) => (
				<div className="study-estimate" key={estimate.label}>
					<h4>{estimate.label}</h4>
					<p className="study-calculation">{estimate.calculation}</p>
					<p>{estimate.implication}</p>
				</div>
			))}
		</section>
		<section className="study-section">
			<h3>API Contract</h3>
			<dl className="study-contracts">
				{guide.api.map((entry) => (
					<div key={entry.signature}>
						<dt>
							<code>{entry.signature}</code>
						</dt>
						<dd>{entry.purpose}</dd>
					</div>
				))}
			</dl>
		</section>
		<section className="study-section">
			<h3>Data Model</h3>
			<dl className="study-contracts">
				{guide.dataModel.map((entry) => (
					<div key={entry.entity}>
						<dt>{entry.entity}</dt>
						<dd>
							<code>{entry.fields}</code>
							<p>{entry.notes}</p>
						</dd>
					</div>
				))}
			</dl>
		</section>
	</>
);

const GuideReview = ({ guide }: { guide: StudyGuide }) => (
	<>
		<section className="study-section">
			<h3>Decisions &amp; Trade-offs</h3>
			{guide.decisions.map((decision) => (
				<div className="study-decision" key={decision.topic}>
					<h4>{decision.topic}</h4>
					<p>{decision.choice}</p>
					<p className="study-tradeoff">
						<strong>Trade-off</strong> {decision.tradeOff}
					</p>
				</div>
			))}
		</section>
		<section className="study-section">
			<h3>Failure Analysis</h3>
			<dl className="study-contracts">
				{guide.failureModes.map((failure) => (
					<div key={failure.scenario}>
						<dt>{failure.scenario}</dt>
						<dd>{failure.handling}</dd>
					</div>
				))}
			</dl>
		</section>
		<section className="study-section">
			<h3>Self-check</h3>
			{guide.selfCheck.map((check, index) => (
				<details className="study-question" key={check.question}>
					<summary>
						<span>{String(index + 1).padStart(2, "0")}</span>
						{check.question}
					</summary>
					<p>{check.answer}</p>
				</details>
			))}
		</section>
	</>
);

const GuideResources = ({ guide }: { guide: StudyGuide }) => (
	<>
		{(["article", "video"] as const).map((kind) => (
			<section className="study-section" key={kind}>
				<h3>{kind === "article" ? "Reading List" : "Watch"}</h3>
				<ul className="study-resources">
					{guide.resources
						.filter((resource) => resource.kind === kind)
						.map((resource) => (
							<li key={resource.url}>
								<a
									href={resource.url}
									target="_blank"
									rel="noreferrer"
									className="study-resource-link"
								>
									{kind === "video" ? (
										<CirclePlay size={22} />
									) : (
										<BookOpen size={21} />
									)}
									<span>
										<strong>{resource.title}</strong>
										<small>
											{resource.author}
											{kind === "video"
												? " / YouTube"
												: ""}
										</small>
									</span>
									<ExternalLink
										size={16}
										aria-hidden="true"
									/>
								</a>
								<p>{resource.why}</p>
							</li>
						))}
				</ul>
			</section>
		))}
		<p className="study-source-note">
			Source review:{" "}
			<time dateTime={guide.reviewedAt}>{guide.reviewedAt}</time>. Video
			titles and links were checked against creator-published pages;
			playback was not verified on the restricted review network. External
			availability can change.
		</p>
	</>
);

const HldStudyView = ({
	set,
	solvedCodes,
	savingCodes,
	onToggle,
}: {
	set: ProblemSet;
	solvedCodes: Set<string>;
	savingCodes: Set<string>;
	onToggle: (code: string) => Promise<void>;
}) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState("");
	const guideHeading = useRef<HTMLHeadingElement>(null);
	const allProblems = set.topics.flatMap((topic) => topic.problems);
	const requestedCode = searchParams.get("guide");
	const selected = requestedCode
		? allProblems.find((problem) => problem.code === requestedCode)
		: allProblems[0];
	const guide = selected?.studyGuide;
	const requestedSection = searchParams.get("section");
	const section =
		sections.find((item) => item.id === requestedSection)?.id ??
		"architecture";
	const selectedIndex = allProblems.findIndex(
		(problem) => problem.code === selected?.code,
	);
	const topicName = set.topics.find((topic) =>
		topic.problems.some((problem) => problem.code === selected?.code),
	)?.name;
	const studiedCount = allProblems.filter((problem) =>
		solvedCodes.has(problem.code),
	).length;
	const normalizedQuery = query.trim().toLowerCase();
	const visibleTopics = set.topics
		.map((topic) => ({
			...topic,
			problems: topic.problems.filter((problem) =>
				`${problem.name} ${topic.name}`
					.toLowerCase()
					.includes(normalizedQuery),
			),
		}))
		.filter((topic) => topic.problems.length);

	const guideLink = (code: string) => {
		const params = new URLSearchParams();
		params.set("guide", code);
		params.set("section", section);
		return `?${params}`;
	};

	const selectSection = (nextSection: string) => {
		const params = new URLSearchParams(searchParams);
		params.set("section", nextSection);
		setSearchParams(params, { replace: true });
	};

	const moveTab = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		const nextIndex =
			event.key === "ArrowRight"
				? (index + 1) % sections.length
				: event.key === "ArrowLeft"
					? (index - 1 + sections.length) % sections.length
					: event.key === "Home"
						? 0
						: event.key === "End"
							? sections.length - 1
							: undefined;
		if (nextIndex === undefined) return;
		event.preventDefault();
		selectSection(sections[nextIndex].id);
		event.currentTarget.parentElement
			?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
			[nextIndex]?.focus();
	};

	const moveGuide = (offset: number) => {
		const next = allProblems[selectedIndex + offset];
		if (!next) return;
		setSearchParams(guideLink(next.code).slice(1));
		guideHeading.current?.focus({ preventScroll: true });
		guideHeading.current?.scrollIntoView({ block: "start" });
	};

	return (
		<>
			<div className="study-collection-heading">
				<h1>{set.title}</h1>
				<p>
					<span>{allProblems.length} topics</span>
					<span>{studiedCount} studied</span>
				</p>
			</div>
			<div className="study-layout">
				<label className="study-mobile-topic">
					<span>Topic</span>
					<select
						aria-label="HLD topic"
						value={selected?.code ?? ""}
						onChange={(event) =>
							setSearchParams(
								guideLink(event.target.value).slice(1),
							)
						}
					>
						<option value="" disabled>
							Choose a topic
						</option>
						{set.topics.map((topic) => (
							<optgroup label={topic.name} key={topic.name}>
								{topic.problems.map((problem) => (
									<option
										value={problem.code}
										key={problem.code}
									>
										{problem.name.replace(/^Design /, "")}
									</option>
								))}
							</optgroup>
						))}
					</select>
				</label>
				<aside className="study-index">
					<label className="study-search">
						<Search size={16} aria-hidden="true" />
						<input
							type="search"
							aria-label="Search HLD topics"
							placeholder="Find a topic"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
					</label>
					<nav aria-label="HLD topics">
						{visibleTopics.map((topic) => (
							<div className="study-topic-group" key={topic.name}>
								<h2>{topic.name}</h2>
								<ul>
									{topic.problems.map((problem) => (
										<li key={problem.code}>
											<Link
												to={guideLink(problem.code)}
												aria-current={
													problem.code ===
													selected?.code
														? "page"
														: undefined
												}
											>
												<span className="study-topic-number">
													{solvedCodes.has(
														problem.code,
													) ? (
														<Check
															size={14}
															aria-label="Studied"
														/>
													) : (
														String(
															allProblems.indexOf(
																problem,
															) + 1,
														).padStart(2, "0")
													)}
												</span>
												<span>
													{problem.name.replace(
														/^Design /,
														"",
													)}
												</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
					{!visibleTopics.length && (
						<p role="status" className="study-empty">
							No matching topics.
						</p>
					)}
				</aside>
				<main className="study-reader">
					{selected && guide ? (
						<article className="study-article" key={selected.code}>
							<header className="study-guide-heading">
								<p className="study-topic-label">{topicName}</p>
								<h2 ref={guideHeading} tabIndex={-1}>
									{selected.name}
								</h2>
								<p className="study-summary">{guide.summary}</p>
								<div className="study-guide-actions">
									<button
										type="button"
										className={`study-progress ${solvedCodes.has(selected.code) ? "is-studied" : ""}`}
										role="checkbox"
										aria-checked={solvedCodes.has(
											selected.code,
										)}
										aria-label={`Mark ${selected.name} as studied`}
										title="Self-reported study progress"
										disabled={savingCodes.has(
											selected.code,
										)}
										onClick={() =>
											void onToggle(selected.code)
										}
									>
										<Check size={16} />
										{savingCodes.has(selected.code)
											? "Saving..."
											: solvedCodes.has(selected.code)
												? "Studied"
												: "Mark studied"}
									</button>
									<div className="study-pagination">
										<span>
											{String(selectedIndex + 1).padStart(
												2,
												"0",
											)}{" "}
											/ {allProblems.length}
										</span>
										<button
											type="button"
											className="study-icon"
											aria-label="Previous topic"
											title="Previous topic"
											disabled={selectedIndex === 0}
											onClick={() => moveGuide(-1)}
										>
											<ArrowLeft size={18} />
										</button>
										<button
											type="button"
											className="study-icon"
											aria-label="Next topic"
											title="Next topic"
											disabled={
												selectedIndex ===
												allProblems.length - 1
											}
											onClick={() => moveGuide(1)}
										>
											<ArrowRight size={18} />
										</button>
									</div>
								</div>
							</header>
							<div
								className="study-tabs"
								role="tablist"
								aria-label="Study sections"
							>
								{sections.map((item, index) => (
									<button
										type="button"
										role="tab"
										key={item.id}
										id={`study-tab-${item.id}`}
										aria-controls="study-panel"
										aria-selected={section === item.id}
										tabIndex={section === item.id ? 0 : -1}
										onClick={() => selectSection(item.id)}
										onKeyDown={(event) =>
											moveTab(event, index)
										}
									>
										<item.icon
											size={16}
											aria-hidden="true"
										/>
										{item.label}
									</button>
								))}
							</div>
							<div
								id="study-panel"
								role="tabpanel"
								aria-labelledby={`study-tab-${section}`}
								tabIndex={0}
								className="study-panel"
								key={section}
							>
								{section === "guide" && (
									<GuideOverview guide={guide} />
								)}
								{section === "architecture" && (
									<>
										<StudyDiagram
											source={guide.architecture.diagram}
											title={selected.name}
										/>
										<section className="study-section">
											<h3>Request Flows</h3>
											{guide.architecture.flows.map(
												(flow) => (
													<div
														className="study-flow"
														key={flow.name}
													>
														<h4>{flow.name}</h4>
														<ol>
															{flow.steps.map(
																(step) => (
																	<li
																		key={
																			step
																		}
																	>
																		{step}
																	</li>
																),
															)}
														</ol>
													</div>
												),
											)}
										</section>
									</>
								)}
								{section === "review" && (
									<GuideReview guide={guide} />
								)}
								{section === "resources" && (
									<GuideResources guide={guide} />
								)}
							</div>
							<footer className="study-footer">
								<span>
									Reviewed{" "}
									<time dateTime={guide.reviewedAt}>
										{guide.reviewedAt}
									</time>
								</span>
								<span>Study progress is self-reported.</span>
							</footer>
						</article>
					) : (
						<section className="study-empty">
							<h2>Guide not found</h2>
							<Link to="/sets/hld">All HLD topics</Link>
						</section>
					)}
				</main>
			</div>
		</>
	);
};

export default HldStudyView;
