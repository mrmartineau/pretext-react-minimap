import { measureNaturalWidth, prepareWithSegments } from "@chenglou/pretext";

const cache = new Map<string, number>();

/**
 * Measure the unwrapped natural pixel width of a single line of text using
 * `@chenglou/pretext`. Result is cached by `font|text` so repeated calls are
 * effectively free.
 *
 * `font` is the same shorthand you would assign to `canvasContext.font`
 * (e.g. `'12px Inter'`) and must match the CSS font used to render the bar.
 */
export function measureWidth(text: string, font: string): number {
	const key = `${font}|${text}`;
	const cached = cache.get(key);
	if (cached !== undefined) return cached;
	const prepared = prepareWithSegments(text, font);
	const width = measureNaturalWidth(prepared);
	cache.set(key, width);
	return width;
}

/** Clear the internal measurement cache. Mostly useful for tests. */
export function clearMeasurementCache(): void {
	cache.clear();
}
