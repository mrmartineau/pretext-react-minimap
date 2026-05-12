import { type RefObject, useEffect, useState } from "react";
import type { MinimapSection } from "./Minimap.js";

export interface UseSectionsOptions {
	/**
	 * CSS selector matching the headings to extract.
	 * Default: `'h1, h2, h3, h4, h5, h6'`.
	 */
	selector?: string;
	/**
	 * Mapper applied to each matched element. Default extracts `id`, `textContent`,
	 * and level inferred from tag name (`H2` → 2). Elements without an `id` are
	 * skipped.
	 */
	map?: (element: HTMLElement) => MinimapSection | null;
}

const DEFAULT_SELECTOR = "h1, h2, h3, h4, h5, h6";

function defaultMap(element: HTMLElement): MinimapSection | null {
	if (!element.id) return null;
	const tag = element.tagName;
	const level = tag.startsWith("H") ? Number.parseInt(tag.slice(1), 10) : 1;
	return {
		id: element.id,
		title: (element.textContent ?? "").trim(),
		level: Number.isFinite(level) ? level : 1,
	};
}

/**
 * Extract `MinimapSection[]` from headings inside a container. Re-runs when
 * the container's subtree changes via `MutationObserver`, so it works with
 * dynamically rendered content.
 */
export function useSections(
	containerRef: RefObject<HTMLElement | null>,
	options: UseSectionsOptions = {},
): MinimapSection[] {
	const { selector = DEFAULT_SELECTOR, map = defaultMap } = options;
	const [sections, setSections] = useState<MinimapSection[]>([]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const collect = () => {
			const elements = container.querySelectorAll<HTMLElement>(selector);
			const next: MinimapSection[] = [];
			for (const el of elements) {
				const section = map(el);
				if (section) next.push(section);
			}
			setSections((prev) => (sameSections(prev, next) ? prev : next));
		};

		collect();
		const observer = new MutationObserver(collect);
		observer.observe(container, {
			childList: true,
			subtree: true,
			characterData: true,
		});
		return () => observer.disconnect();
	}, [containerRef, selector, map]);

	return sections;
}

function sameSections(a: MinimapSection[], b: MinimapSection[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		const x = a[i];
		const y = b[i];
		if (!x || !y) return false;
		if (x.id !== y.id || x.title !== y.title || x.level !== y.level) {
			return false;
		}
	}
	return true;
}
