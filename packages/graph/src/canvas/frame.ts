/* The canvas's frame (#171): how the drawing is scaled and placed in the viewport, how far the
 * paper scrolls, and where to scroll so a zoom keeps the reader's point in place.
 *
 * Pure, because none of it needs the DOM beyond two measured numbers, and the defects it fixes
 * were all arithmetic: the scroll extent was the UNSCALED world box (a CSS transform does not
 * change layout size), so past fit the far side of the drawing was unreachable and at fit there
 * was empty scroll; the padding was added on the leading edge only; and a zoom scaled from the
 * canvas origin, sliding the content away from where the reader was looking.
 */
import type { Size } from '../layout/types.js'

/** The smallest scale fit will choose: below it a drawing is noise, however large it is. */
const MIN_SCALE = 0.08

export type Frame = {
	/** The scale that fits the content in the viewport, before the reader's zoom. */
	fit: number
	/** fit × zoom — what the world is drawn at. */
	scale: number
	/** Where the scaled world's top-left sits inside the scrollable extent. */
	tx: number
	ty: number
	/** The scrollable extent: the scaled drawing plus `pad` all round, never less than the viewport. */
	extent: Size
}

type FrameInput = { vw: number; vh: number; content: Size; zoom: number; pad: number }

/** Centred while the drawing is smaller than the viewport; `pad` in from the edge once it is not. */
const offset = (viewport: number, drawn: number, pad: number) => Math.max(pad, (viewport - drawn) / 2)

export function frameOf({ vw, vh, content, zoom, pad }: FrameInput): Frame {
	const fit =
		Math.max(MIN_SCALE, Math.min((vw - pad * 2) / content.w, (vh - pad * 2) / content.h, 1)) || 0.5
	const scale = fit * zoom
	const drawn = { w: content.w * scale, h: content.h * scale }
	return {
		fit,
		scale,
		tx: offset(vw, drawn.w, pad),
		ty: offset(vh, drawn.h, pad),
		// The same pad on the trailing edge as the leading one, so the far side is reachable
		// with room to spare — and exactly the viewport when the drawing fits, so nothing scrolls.
		extent: { w: Math.max(vw, drawn.w + pad * 2), h: Math.max(vh, drawn.h + pad * 2) }
	}
}

type Scroll = { left: number; top: number }

/**
 * The scroll that keeps the content point under `anchor` (viewport coordinates) where it was,
 * across a change of frame. A pinch anchors at the pointer; a zoom button at the viewport centre.
 *
 * It holds on an axis that scrolls. On an axis where the drawing still fits, the drawing stays
 * centred instead (`offset`), and no scroll can move it — fitting wins over anchoring there.
 */
export function anchoredScroll(input: { before: Frame; after: Frame; scroll: Scroll; anchor: { x: number; y: number } }): Scroll {
	const { before, after, scroll, anchor } = input
	const x = (scroll.left + anchor.x - before.tx) / before.scale
	const y = (scroll.top + anchor.y - before.ty) / before.scale
	return {
		left: Math.max(0, x * after.scale + after.tx - anchor.x),
		top: Math.max(0, y * after.scale + after.ty - anchor.y)
	}
}
