<script lang="ts">
	/**
	 * Zoom in, out, and back to fit.
	 *
	 * Buttons rather than a slider: each is one tab stop and one keypress, so the diagram is
	 * navigable without a trackpad. The canvas handles ctrl+wheel and pinch itself — this is
	 * the discoverable path to the same value, not the only one.
	 */
	import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP, clampZoom } from './zoom.js'

	type Props = {
		zoom?: number
		onchange?: (value: number) => void
	}

	let { zoom = 1, onchange }: Props = $props()

	const percent = $derived(Math.round(zoom * 100))

	// Clamped here as well as in the canvas: the buttons disable at the ends, but a caller can
	// hand this control a value from anywhere, and reporting one outside the range would push
	// the canvas past a limit it has already agreed to.
	const step = (factor: number) => onchange?.(clampZoom(zoom * factor))
</script>

<div data-graph-zoom-controls role="group" aria-label="Zoom">
	<button
		type="button"
		data-graph-zoom="out"
		aria-label="Zoom out"
		disabled={zoom <= ZOOM_MIN}
		onclick={() => step(1 / ZOOM_STEP)}>−</button
	>
	<button
		type="button"
		data-graph-zoom="reset"
		aria-label="Reset zoom to fit"
		onclick={() => onchange?.(1)}>{percent}%</button
	>
	<button
		type="button"
		data-graph-zoom="in"
		aria-label="Zoom in"
		disabled={zoom >= ZOOM_MAX}
		onclick={() => step(ZOOM_STEP)}>+</button
	>
</div>
