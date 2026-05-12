import {
	type CSSProperties,
	type MouseEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { measureWidth } from "./measure.js";
import {
	createActiveSectionTracker,
	getVisibleContentWindow,
	type ScrollTarget,
} from "./scrollTracking.js";

export interface MinimapSection {
	/** DOM id of the element this entry scrolls to. */
	id: string;
	/** Visible label, shown in the hover tooltip. */
	title: string;
	/** Heading level, 1-6. Defaults to 1. Drives indent and default font size. */
	level?: number;
}

export interface MinimapProps {
	sections: MinimapSection[];
	/**
	 * Scroll container the minimap reflects. Pass an HTMLElement for an internal
	 * scroll area, or omit / pass `window` for page scroll. Default: `window`.
	 */
	scrollTarget?: ScrollTarget | null;
	/**
	 * Returns the canvas-font shorthand used to measure each section's bar width.
	 * Must match the shape of `ctx.font` (e.g. `'12px Inter'`).
	 * Default: 11px / 9px / 7px sans-serif by level.
	 */
	getFont?: (section: MinimapSection) => string;
	/** Top offset (in CSS px) for sticky headers that occlude the scroll area. */
	topInset?: number;
	/** Show the translucent viewport indicator. Default: true. */
	showViewport?: boolean;
	/** Smooth-scroll on click. Default: true. */
	smoothScroll?: boolean;
	/** Tooltip placement relative to the bars. Default: `'left'`. */
	tooltipSide?: "left" | "right";
	/**
	 * Multiplier applied to measured pixel widths before rendering a bar.
	 * When omitted, the component auto-fits so the widest heading just spans
	 * the available bar area.
	 */
	scale?: number;
	/** Called when a bar is clicked. Return `false` to skip the default scroll. */
	onSectionClick?: (
		section: MinimapSection,
		event: MouseEvent,
	) => boolean | undefined;
	className?: string;
	style?: CSSProperties;
	"aria-label"?: string;
}

const DEFAULT_FONT_BY_LEVEL: Record<number, string> = {
	1: "11px sans-serif",
	2: "9px sans-serif",
	3: "8px sans-serif",
	4: "7px sans-serif",
	5: "7px sans-serif",
	6: "7px sans-serif",
};

function defaultGetFont(section: MinimapSection): string {
	const level = section.level ?? 1;
	return DEFAULT_FONT_BY_LEVEL[level] ?? "7px sans-serif";
}

function resolveScrollTarget(
	target: ScrollTarget | null | undefined,
): ScrollTarget | null {
	if (target === null) return null;
	if (target === undefined) {
		return typeof window === "undefined" ? null : window;
	}
	return target;
}

export function Minimap({
	sections,
	scrollTarget,
	getFont = defaultGetFont,
	topInset = 0,
	showViewport = true,
	smoothScroll = true,
	tooltipSide = "left",
	scale: scaleProp,
	onSectionClick,
	className,
	style,
	"aria-label": ariaLabel = "Section navigation",
}: MinimapProps) {
	const itemsRef = useRef<HTMLDivElement | null>(null);
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const [activeId, setActiveId] = useState<string | null>(
		sections[0]?.id ?? null,
	);

	const widths = useMemo(() => {
		if (typeof document === "undefined") {
			return sections.map(() => 0);
		}
		return sections.map((section) =>
			measureWidth(section.title, getFont(section)),
		);
	}, [sections, getFont]);

	const anchorIds = useMemo(() => sections.map((s) => s.id), [sections]);

	const [innerWidth, setInnerWidth] = useState(0);

	useLayoutEffect(() => {
		const el = itemsRef.current;
		if (!el || typeof ResizeObserver === "undefined") return;
		const measure = () => {
			const cs = window.getComputedStyle(el);
			const pl = Number.parseFloat(cs.paddingLeft) || 0;
			const pr = Number.parseFloat(cs.paddingRight) || 0;
			setInnerWidth(Math.max(0, el.clientWidth - pl - pr));
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const autoScale = useMemo(() => {
		if (innerWidth <= 0 || widths.length === 0) return 1;
		const max = Math.max(...widths);
		if (max <= 0) return 1;
		return Math.min(1, innerWidth / max);
	}, [innerWidth, widths]);

	const scale = scaleProp ?? autoScale;

	useEffect(() => {
		const target = resolveScrollTarget(scrollTarget);
		if (!target || anchorIds.length === 0) return;

		const tracker = createActiveSectionTracker({
			scrollTarget: target,
			anchorIds,
			topInset,
			initialActiveId: anchorIds[0],
			onActiveChange: setActiveId,
		});

		return () => tracker.disconnect();
	}, [anchorIds, scrollTarget, topInset]);

	useEffect(() => {
		const target = resolveScrollTarget(scrollTarget);
		if (!target || !showViewport) return;
		const viewport = viewportRef.current;
		const items = itemsRef.current;
		if (!viewport || !items) return;

		const update = () => {
			const { scrollHeight, visibleTop, visibleHeight } =
				getVisibleContentWindow(target, topInset);
			const itemsHeight = items.clientHeight;

			if (scrollHeight <= visibleHeight || itemsHeight <= 0) {
				viewport.style.display = "none";
				return;
			}
			viewport.style.display = "";

			const ratio = itemsHeight / scrollHeight;
			const indicatorHeight = Math.min(
				Math.max(visibleHeight * ratio, 12),
				itemsHeight,
			);
			const rawTop = visibleTop * ratio;
			const maxTop = Math.max(itemsHeight - indicatorHeight, 0);
			const indicatorTop = Math.min(Math.max(rawTop, 0), maxTop);
			const itemsOffset = items.offsetTop;

			viewport.style.height = `${indicatorHeight}px`;
			viewport.style.top = `${itemsOffset + indicatorTop}px`;
		};

		update();
		target.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update, { passive: true });
		const ro =
			typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
		ro?.observe(items);
		return () => {
			target.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
			ro?.disconnect();
		};
	}, [scrollTarget, showViewport, topInset]);

	const handleClick = useCallback(
		(section: MinimapSection, event: MouseEvent) => {
			const proceed = onSectionClick?.(section, event);
			if (proceed === false) return;
			const target = document.getElementById(section.id);
			if (!target) return;
			target.scrollIntoView({
				behavior: smoothScroll ? "smooth" : "auto",
				block: "start",
			});
		},
		[onSectionClick, smoothScroll],
	);

	return (
		<nav
			className={`prm-minimap${className ? ` ${className}` : ""}`}
			aria-label={ariaLabel}
			data-tooltip-side={tooltipSide}
			style={style}
		>
			{showViewport && (
				<div ref={viewportRef} className="prm-viewport" aria-hidden="true" />
			)}
			<div ref={itemsRef} className="prm-items">
				{sections.map((section, index) => {
					const level = section.level ?? 1;
					const width = (widths[index] ?? 0) * scale;
					const isActive = activeId === section.id;
					return (
						<button
							key={section.id}
							type="button"
							className={`prm-row${isActive ? " is-active" : ""}`}
							data-level={level}
							aria-label={`Jump to ${section.title}`}
							aria-current={isActive ? "true" : undefined}
							onClick={(event) => handleClick(section, event)}
							style={
								{
									"--prm-row-indent": `calc(var(--prm-indent, 4px) * ${level - 1})`,
								} as CSSProperties
							}
						>
							<span
								className="prm-bar"
								style={{ width: `${Math.max(width, 4)}px` }}
							/>
							<span className="prm-tooltip" role="tooltip">
								{section.title}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
