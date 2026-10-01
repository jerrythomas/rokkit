<script lang="ts">
	/**
	 * Zoom in, out, and back to fit.
	 *
	 * Buttons rather than a slider: each is one tab stop and one keypress, so the diagram is
	 * navigable without a trackpad. The canvas handles ctrl+wheel and pinch itself — this is
	 * the discoverable path to the same value, not the only one.
	 */
	import { choices } from '../actions/choices.js'
	import { say } from '../messages.js'
	import { ZOOM_MAX, ZOOM_MIN, nextZoom } from './zoom.js'
	import type { ZoomMove } from './zoom.js'

	type Props = {
		zoom?: number
		onchange?: (value: number) => void
	}

	let { zoom = 1, onchange }: Props = $props()

	const percent = $derived(Math.round(zoom * 100))
</script>

<!-- Clamped by `nextZoom` as well as in the canvas: the buttons disable at the ends, but a
     caller can hand this control a value from anywhere, and reporting one outside the range
     would push the canvas past a limit it has already agreed to. -->
<div
	data-graph-zoom-controls
	role="group"
	aria-label={say('zoom')}
	use:choices={{ onchoose: (move) => onchange?.(nextZoom(zoom, move as ZoomMove)) }}
>
	<button
		type="button"
		data-graph-zoom="out"
		data-graph-choice="out"
		aria-label={say('zoomOut')}
		disabled={zoom <= ZOOM_MIN}>−</button
	>
	<button type="button" data-graph-zoom="reset" data-graph-choice="reset" aria-label={say('zoomReset')}
		>{percent}%</button
	>
	<button
		type="button"
		data-graph-zoom="in"
		data-graph-choice="in"
		aria-label={say('zoomIn')}
		disabled={zoom >= ZOOM_MAX}>+</button
	>
</div>
