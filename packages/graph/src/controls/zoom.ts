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
