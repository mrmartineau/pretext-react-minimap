export type ScrollTarget = HTMLElement | Window;

interface ScrollMetrics {
	scrollHeight: number;
	clientHeight: number;
	scrollTop: number;
	containerTop: number;
}

function isWindow(target: ScrollTarget): target is Window {
	return typeof Window !== "undefined" && target instanceof Window;
}

export function getScrollMetrics(target: ScrollTarget): ScrollMetrics {
	if (isWindow(target)) {
		const doc = document.documentElement;
		return {
			scrollHeight: doc.scrollHeight,
			clientHeight: window.innerHeight,
			scrollTop: window.scrollY,
			containerTop: 0,
		};
	}
	const rect = target.getBoundingClientRect();
	return {
		scrollHeight: target.scrollHeight,
		clientHeight: target.clientHeight,
		scrollTop: target.scrollTop,
		containerTop: rect.top,
	};
}

export interface VisibleWindow {
	scrollHeight: number;
	clientHeight: number;
	visibleTop: number;
	visibleHeight: number;
}

export function getVisibleContentWindow(
	target: ScrollTarget,
	topInset = 0,
): VisibleWindow {
	const { scrollHeight, clientHeight, scrollTop } = getScrollMetrics(target);
	const visibleHeight = Math.max(clientHeight - topInset, 0);
	const maxTop = Math.max(scrollHeight - visibleHeight, 0);
	const rawTop = scrollTop + topInset;
	const visibleTop = Math.min(Math.max(rawTop, 0), maxTop);
	return { scrollHeight, clientHeight, visibleTop, visibleHeight };
}

function getActiveLineTop(target: ScrollTarget, topInset: number): number {
	const { containerTop } = getScrollMetrics(target);
	return containerTop + topInset;
}

interface TrackerOptions {
	scrollTarget: ScrollTarget;
	anchorIds: string[];
	topInset: number;
	onActiveChange: (activeId: string) => void;
	initialActiveId?: string;
}

export interface ActiveSectionTracker {
	refresh: () => void;
	disconnect: () => void;
}

/**
 * Tracks which anchor element is "active" inside a scroll container by
 * combining an IntersectionObserver with a distance-to-top-edge tie-break.
 *
 * Adapted from the lang-compare Astro minimap. Works with both window and
 * an explicit scroll container.
 */
export function createActiveSectionTracker(
	options: TrackerOptions,
): ActiveSectionTracker {
	const { scrollTarget, anchorIds, topInset, onActiveChange, initialActiveId } =
		options;

	const anchorMap = new Map<string, HTMLElement>();
	const intersectingIds = new Set<string>();
	const orderedIds = anchorIds.filter(
		(id, index) => anchorIds.indexOf(id) === index,
	);

	for (const id of orderedIds) {
		const anchor = document.getElementById(id);
		if (anchor) anchorMap.set(id, anchor);
	}

	let currentActiveId: string | null = initialActiveId ?? null;
	let observer: IntersectionObserver | null = null;

	const setActive = (id: string) => {
		if (id === currentActiveId) return;
		currentActiveId = id;
		onActiveChange(id);
	};

	const updateActiveFromViewport = () => {
		if (!anchorMap.size) return;
		const activeLineTop = getActiveLineTop(scrollTarget, topInset);
		let bestId: string | null = null;
		let bestDistance = Number.POSITIVE_INFINITY;

		for (const id of intersectingIds) {
			const anchor = anchorMap.get(id);
			if (!anchor) continue;
			const distance = Math.abs(
				anchor.getBoundingClientRect().top - activeLineTop,
			);
			if (distance < bestDistance) {
				bestDistance = distance;
				bestId = id;
			}
		}

		if (!bestId) {
			let fallbackDistance = Number.NEGATIVE_INFINITY;
			for (const id of orderedIds) {
				const anchor = anchorMap.get(id);
				if (!anchor) continue;
				const distance = anchor.getBoundingClientRect().top - activeLineTop;
				if (distance <= 0 && distance > fallbackDistance) {
					fallbackDistance = distance;
					bestId = id;
				}
			}
		}

		if (!bestId) {
			bestId = orderedIds.find((id) => anchorMap.has(id)) ?? null;
		}

		if (bestId) setActive(bestId);
	};

	const buildObserver = () => {
		observer?.disconnect();
		intersectingIds.clear();

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = (entry.target as HTMLElement).id;
					if (!id) continue;
					if (entry.isIntersecting) intersectingIds.add(id);
					else intersectingIds.delete(id);
				}
				updateActiveFromViewport();
			},
			{
				root: isWindow(scrollTarget) ? null : scrollTarget,
				rootMargin: `-${topInset}px 0px -60% 0px`,
				threshold: 0,
			},
		);

		for (const anchor of anchorMap.values()) {
			observer.observe(anchor);
		}
	};

	const onScroll = () => updateActiveFromViewport();
	const onResize = () => {
		buildObserver();
		updateActiveFromViewport();
	};

	scrollTarget.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", onResize, { passive: true });

	buildObserver();
	if (initialActiveId) onActiveChange(initialActiveId);
	updateActiveFromViewport();

	return {
		refresh: () => {
			buildObserver();
			updateActiveFromViewport();
		},
		disconnect: () => {
			scrollTarget.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			observer?.disconnect();
		},
	};
}
