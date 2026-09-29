/* Squarified treemap — Bruls, Huizing & van Wijk (2000).
 *
 * Fills a rectangle with child rectangles whose areas are proportional to their values, laid
 * out in rows chosen to keep each rectangle as square as possible.
 *
 * The naive alternative (slice-and-dice: split the rect by value along one axis, alternating
 * per level) is far simpler and unusable here — it produces 1px-wide slivers at any real
 * value spread, and a sliver holds no label. A box you cannot read is a box you cannot
 * decide to click, which is the whole of drill-down navigation.
 *
 * Hand-written rather than taken from `d3-hierarchy`: the algorithm is small and naturally
 * deterministic, and `@rokkit/graph` has no third-party runtime dependency — a property
 * `dependencies.spec.js` asserts, so acquiring the first one should buy more than 80 lines.
 */

export type Rect = { x: number; y: number; w: number; h: number }
export type Sized = { value: number }
export type Placed<T> = { item: T; rect: Rect }

/**
 * Worst aspect ratio in a row of areas laid along `side`. Lower is squarer.
 *
 * No zero guard: a side or total of 0 divides to Infinity in JS, which is exactly the answer —
 * a row with no room is infinitely bad and the caller closes it. A guard here would be a
 * statement no input can reach.
 */
function worst(areas: number[], side: number, total: number): number {
	const max = Math.max(...areas)
	const min = Math.min(...areas)
	const s2 = side * side
	const t2 = total * total

	return Math.max((s2 * max) / t2, t2 / (s2 * min))
}

/** Lay one finished row along the short side of `rect`, and return what remains. */
function placeRow<T>(
	row: { item: T; area: number }[],
	rect: Rect,
	out: Placed<T>[]
): Rect {
	const total = row.reduce((sum, r) => sum + r.area, 0)
	const vertical = rect.w >= rect.h
	// Thickness of the band this row occupies, derived from its total area so the row exactly
	// consumes the share of the rectangle its values earned.
	const thickness = total / (vertical ? rect.h : rect.w)

	let offset = vertical ? rect.y : rect.x
	for (const entry of row) {
		const length = entry.area / thickness
		out.push({
			item: entry.item,
			rect: vertical
				? { x: rect.x, y: offset, w: thickness, h: length }
				: { x: offset, y: rect.y, w: length, h: thickness }
		})
		offset += length
	}

	return vertical
		? { x: rect.x + thickness, y: rect.y, w: rect.w - thickness, h: rect.h }
		: { x: rect.x, y: rect.y + thickness, w: rect.w, h: rect.h - thickness }
}

/**
 * Place `items` inside `rect`, area proportional to `value`.
 *
 * Largest first: the greedy row-closing rule only produces near-square boxes if the big ones
 * are placed while there is room to choose. Ties break on the caller's order, which is already
 * sorted, so the result is deterministic.
 *
 * A zero or negative value gets the same floor as a tiny one — "unknown" is a normal state in
 * a partially-indexed graph, and a zero-area box is indistinguishable from a missing one.
 */
/**
 * Does adding `area` make this row's worst aspect ratio worse?
 *
 * That comparison IS the algorithm — it trades row length against squareness, and closing the
 * row at the moment the answer turns yes is what keeps boxes near-square instead of slivers.
 */
function shouldClose(areas: number[], area: number, side: number): boolean {
	if (areas.length === 0) return false
	const total = areas.reduce((sum, a) => sum + a, 0)

	return worst([...areas, area], side, total + area) > worst(areas, side, total)
}

export function squarify<T extends Sized>(items: T[], rect: Rect, minimum = 0): Placed<T>[] {
	if (items.length === 0 || rect.w <= 0 || rect.h <= 0) return []

	const ordered = [...items].sort((a, b) => b.value - a.value)
	const floor = Math.max(minimum, 0)
	const values = ordered.map((item) => Math.max(item.value, floor))
	const total = values.reduce((sum, v) => sum + v, 0)
	if (total <= 0) return evenly(ordered, rect)

	// Values are scaled into pixels ONCE, so every row shares one area currency.
	const scale = (rect.w * rect.h) / total
	const out: Placed<T>[] = []

	let remaining = rect
	let row: { item: T; area: number }[] = []

	ordered.forEach((item, i) => {
		const area = values[i] * scale
		if (shouldClose(row.map((r) => r.area), area, Math.min(remaining.w, remaining.h))) {
			remaining = placeRow(row, remaining, out)
			row = []
		}
		row.push({ item, area })
	})

	// `row` always holds at least the final item, so no guard: the loop pushes before it ends.
	placeRow(row, remaining, out)

	return out
}

/** Equal shares, for when every value is zero and proportion means nothing. */
function evenly<T>(items: T[], rect: Rect): Placed<T>[] {
	const columns = Math.ceil(Math.sqrt(items.length))
	const rows = Math.ceil(items.length / columns)
	const w = rect.w / columns
	const h = rect.h / rows

	return items.map((item, i) => ({
		item,
		rect: {
			x: rect.x + (i % columns) * w,
			y: rect.y + Math.floor(i / columns) * h,
			w,
			h
		}
	}))
}
