/* Zoom bounds, shared by the canvas and the zoom control.
 *
 * Both have to agree: the canvas clamps a ctrl+wheel gesture and the control disables its
 * buttons at the ends, and if those two numbers drift the control goes dead a step before the
 * gesture does — which reads as a broken button.
 */

export const ZOOM_MIN = 0.25
export const ZOOM_MAX = 4
/** One step of the +/- buttons, and of one wheel notch. */
export const ZOOM_STEP = 1.25

/** `value` brought inside the range. */
export const clampZoom = (value: number): number =>
	Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))

export type ZoomMove = 'in' | 'out' | 'reset'

/** The zoom after one move: a notch in or out, kept inside the range, or back to fit. */
export function nextZoom(zoom: number, move: ZoomMove): number {
	if (move === 'reset') return 1
	return clampZoom(zoom * (move === 'in' ? ZOOM_STEP : 1 / ZOOM_STEP))
}

/** Pixels per wheel unit, by `WheelEvent.deltaMode`: pixels, lines, pages. */
const WHEEL_PIXELS = [1, 16, 800]
/** Zoom per pixel of wheel travel: 2^(−px × rate). */
const WHEEL_RATE = 0.01

/**
 * The zoom factor for one ctrl/⌘-wheel event, in proportion to how far it moved. A trackpad
 * pinch sends many small events, each a small factor, so it zooms smoothly; no single event
 * moves further than one notch, so a mouse wheel steps as the +/- buttons do.
 */
export function wheelFactor(deltaY: number, deltaMode = 0): number {
	const px = deltaY * (WHEEL_PIXELS[deltaMode] ?? 1)
	const factor = 2 ** (-px * WHEEL_RATE)
	return Math.min(ZOOM_STEP, Math.max(1 / ZOOM_STEP, factor))
}

/** `zoom` scaled by `factor`, kept inside the range. */
export const zoomBy = (zoom: number, factor: number): number => clampZoom(zoom * factor)
