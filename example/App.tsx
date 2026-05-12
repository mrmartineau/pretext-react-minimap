import { useMemo, useRef } from "react";
import { Minimap, useSections } from "../src/index.js";

interface Chapter {
	id: string;
	title: string;
	level: number;
	body: string[];
}

const LOREM_SHORT =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus lobortis, lectus vitae bibendum tempor, leo sapien tristique nisl.";
const LOREM_LONG =
	"Pretext sidesteps DOM measurement by implementing its own multi-line text layout algorithm. It uses canvas for ground-truth segment widths, then does pure arithmetic for the wrap pass. Because measurement is decoupled from the document, you can ask shape questions about text — natural width, line count, wrapped height — without forcing a layout reflow on the browser.";

const CHAPTERS: Chapter[] = [
	{
		id: "intro",
		title: "Introduction",
		level: 1,
		body: [LOREM_SHORT, LOREM_LONG],
	},
	{
		id: "goals",
		title: "Project goals",
		level: 2,
		body: [LOREM_LONG, LOREM_SHORT],
	},
	{
		id: "goals-perf",
		title: "Performance first",
		level: 3,
		body: [LOREM_LONG],
	},
	{
		id: "goals-a11y",
		title: "Accessibility second",
		level: 3,
		body: [LOREM_SHORT, LOREM_LONG],
	},
	{
		id: "install",
		title: "Installation",
		level: 2,
		body: [LOREM_SHORT],
	},
	{
		id: "api",
		title: "API reference",
		level: 1,
		body: [LOREM_LONG, LOREM_SHORT, LOREM_LONG],
	},
	{
		id: "api-minimap",
		title: "Minimap component",
		level: 2,
		body: [LOREM_LONG],
	},
	{
		id: "api-hooks",
		title: "Hooks",
		level: 2,
		body: [LOREM_LONG, LOREM_SHORT],
	},
	{
		id: "api-hooks-use-sections",
		title: "useSections",
		level: 3,
		body: [LOREM_SHORT, LOREM_LONG],
	},
	{
		id: "api-hooks-measure",
		title: "measureWidth",
		level: 3,
		body: [LOREM_LONG],
	},
	{
		id: "styling",
		title: "Styling and theming",
		level: 1,
		body: [LOREM_LONG, LOREM_SHORT],
	},
	{
		id: "styling-vars",
		title: "CSS variables",
		level: 2,
		body: [LOREM_LONG, LOREM_LONG],
	},
	{
		id: "styling-dark",
		title: "Dark mode",
		level: 2,
		body: [LOREM_SHORT],
	},
	{
		id: "examples",
		title: "Examples and recipes",
		level: 1,
		body: [LOREM_LONG, LOREM_SHORT, LOREM_LONG],
	},
	{
		id: "examples-blog",
		title: "Long-form article",
		level: 2,
		body: [LOREM_LONG, LOREM_LONG],
	},
	{
		id: "examples-docs",
		title: "Docs site sidebar",
		level: 2,
		body: [LOREM_LONG],
	},
	{
		id: "faq",
		title: "Frequently asked questions",
		level: 1,
		body: [LOREM_LONG, LOREM_LONG, LOREM_SHORT],
	},
];

function HeadingForLevel({
	level,
	id,
	children,
}: {
	level: number;
	id: string;
	children: string;
}) {
	const Tag = `h${Math.min(Math.max(level, 1), 6)}` as
		| "h1"
		| "h2"
		| "h3"
		| "h4"
		| "h5"
		| "h6";
	return <Tag id={id}>{children}</Tag>;
}

export function App() {
	const articleRef = useRef<HTMLElement>(null);

	// Demo: use the auto-extracting hook instead of hand-rolling sections.
	const sections = useSections(articleRef);

	// Or, equivalent static list:
	const staticSections = useMemo(
		() =>
			CHAPTERS.map((c) => ({
				id: c.id,
				title: c.title,
				level: c.level,
			})),
		[],
	);

	return (
		<div className="page">
			<header className="page-header">
				<h1 className="page-title">pretext-react-minimap</h1>
				<p className="page-subtitle">
					Section-heading minimap for React. Bar widths come from{" "}
					<code>@chenglou/pretext</code>'s DOM-free text measurement.
				</p>
			</header>

			<div className="layout">
				<article ref={articleRef} className="article">
					{CHAPTERS.map((chapter) => (
						<section key={chapter.id}>
							<HeadingForLevel id={chapter.id} level={chapter.level}>
								{chapter.title}
							</HeadingForLevel>
							{chapter.body.map((p) => (
								<p key={`${chapter.id}-${p.slice(0, 24)}`}>{p}</p>
							))}
						</section>
					))}
				</article>

				<aside className="minimap-rail">
					<Minimap
						sections={sections.length ? sections : staticSections}
						aria-label="Documentation outline"
					/>
				</aside>
			</div>
		</div>
	);
}
