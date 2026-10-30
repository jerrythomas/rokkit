<script lang="ts">
	/**
	 * The shell every named diagram shares: a canvas, controls over it, a legend under it.
	 *
	 * Internal on purpose. A consumer composes by picking a diagram — `ErDiagram`, `CallTree`
	 * — not by assembling a frame, exactly as they pick `BarChart` rather than assembling a
	 * `Plot` with a geom. This exists so the seven diagrams do not each re-declare the same
	 * positioned box.
	 */
	import type { Snippet } from 'svelte'

	type Props = {
		canvas: Snippet
		/** Controls drawn OVER the canvas, in the strip along its bottom. */
		overlay?: Snippet
		/** The zoom, in its own corner of the canvas (the control places itself). */
		zoom?: Snippet
		/** A legend or caption under the canvas, in the layout flow rather than over it. */
		footer?: Snippet
		class?: string
	}

	let { canvas, overlay, zoom, footer, class: className = '' }: Props = $props()
</script>

<div data-graph-diagram class={className}>
	<!-- The canvas fills what is left after the footer, so a legend never overlaps the
	     picture and never gets clipped by it. -->
	<div data-graph-diagram-canvas>
		{@render canvas()}
		{#if overlay}
			<div data-graph-diagram-overlay>{@render overlay()}</div>
		{/if}
		{@render zoom?.()}
	</div>
	{#if footer}
		<div data-graph-diagram-footer>{@render footer()}</div>
	{/if}
</div>
