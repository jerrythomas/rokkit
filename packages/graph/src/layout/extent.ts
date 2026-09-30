import type { Size } from './types.js'

type Box = { x: number; y: number; w?: number; h?: number }

/** Bottom-right extent of a set of boxes (a box with no size is a point), or {0,0}. */
function extentOf(boxes: Box[]): Size {
	let w = 0
	let h = 0
	for (const box of boxes) {
		w = Math.max(w, box.x + (box.w ?? 0))
		h = Math.max(h, box.y + (box.h ?? 0))
	}
	return { w, h }
}

/**
 * The true content extent of a layout, as distinct from its `size`.
 *
 * `LayoutResult.size` adds a +60 margin on the right and bottom only, so fitting to it hugs the
 * left/top edge and floats away from the right/bottom. Centring needs the real bounds: the
 * clusters', or — for an ungrouped layout (neighborhood), which reports none — the cards', and
 * the layout size only when both are empty.
 */
export function contentExtent(clusters: Box[], cards: Record<string, Box>, size: Size): Size {
	let { w, h } = extentOf(clusters)
	if (!w || !h) {
		const fromCards = extentOf(Object.values(cards))
		w = Math.max(w, fromCards.w)
		h = Math.max(h, fromCards.h)
	}
	return { w: w || size.w, h: h || size.h }
}
