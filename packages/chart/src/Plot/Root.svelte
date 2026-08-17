<script lang="ts">
	import { setContext, untrack, onMount } from 'svelte'
	import type { Snippet } from 'svelte'
	import { PlotState } from '../PlotState.svelte.js'
	import { defaultPreset } from '../lib/preset.js'
	import DefinePatterns from '../patterns/DefinePatterns.svelte'

	type Margin = { top?: number; right?: number; bottom?: number; left?: number }

	type Props = {
		data?: Record<string, unknown>[]
		x?: string
		y?: string
		color?: string
		width?: number
		height?: number
		margin?: Margin
		mode?: 'light' | 'dark'
		/** Chart direction. 'horizontal' stands the category axis up and runs the value
		 *  axis sideways — x/y channels are unchanged. `flip` is sugar for 'horizontal'. */
		orientation?: 'vertical' | 'horizontal'
		flip?: boolean
		/** Order the category (band) axis by aggregated value instead of by label — bars sorted
		 *  by size (histogram-style). 'desc' (largest first) | 'asc'. */
		sort?: 'asc' | 'desc'
		/** Animate marks on data/flip changes. Enabled one frame after mount so the
		 *  initial layout paints un-animated. Default `true`. */
		animate?: boolean
		children?: Snippet
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		color = undefined,
		width = 600,
		height = 400,
		margin = undefined,
		mode = undefined,
		orientation = undefined,
		flip = false,
		sort = undefined,
		animate = true,
		children
	}: Props = $props()

	const resolvedOrientation = $derived(flip ? 'horizontal' : orientation)

	// Responsive width: observe the container and use its actual pixel width so the chart stretches
	// to fill the stage (like the high-level PlotChart). The `width` prop is the initial fallback.
	let containerEl = $state<HTMLDivElement | null>(null)
	let observedWidth = $state(0)
	$effect(() => {
		if (!containerEl) return
		const ro = new ResizeObserver((entries) => {
			const w = Math.floor(entries[0].contentRect.width)
			if (w > 0) observedWidth = w
		})
		ro.observe(containerEl)
		return () => ro.disconnect()
	})
	const effectiveWidth = $derived(observedWidth > 0 ? observedWidth : width)

	// Enable data-change / flip animation one frame after mount so the initial
	// layout paints without animating (see base/chart.css [data-plot-animate]).
	let animateReady = $state(false)
	onMount(() => {
		const raf = requestAnimationFrame(() => {
			animateReady = true
		})
		return () => cancelAnimationFrame(raf)
	})

	const plotState = untrack(
		() =>
			new PlotState({
				data,
				channels: { x, y, color },
				width,
				height,
				margin,
				mode,
				orientation: flip ? 'horizontal' : orientation,
				sort,
				chartPreset: defaultPreset
			})
	)

	$effect(() => {
		plotState.update({
			data,
			channels: { x, y, color },
			width: effectiveWidth,
			height,
			margin,
			mode,
			orientation: resolvedOrientation,
			sort,
			chartPreset: defaultPreset
		})
	})

	setContext('plot-state', plotState)

	const svgWidth = $derived(plotState.innerWidth + (margin?.left ?? 50) + (margin?.right ?? 30))
	const svgHeight = $derived(plotState.innerHeight + (margin?.top ?? 20) + (margin?.bottom ?? 40))
	const marginLeft = $derived(margin?.left ?? 50)
	const marginTop = $derived(margin?.top ?? 20)
</script>

<div class="plot-root-container" bind:this={containerEl}>
	<svg
		width={effectiveWidth}
		{height}
		viewBox="0 0 {svgWidth} {svgHeight}"
		role="img"
		aria-label="Chart visualization"
		data-plot-root
		data-plot-animate={animate && animateReady ? '' : undefined}
	>
		<!-- SVG <pattern> defs for texture fills (Bar/Area/Arc/Box/Violin `pattern` channel) -->
		<DefinePatterns />
		<g transform="translate({marginLeft}, {marginTop})" data-plot-canvas>
			{@render children?.()}
		</g>
	</svg>
</div>

<style>
	.plot-root-container {
		width: 100%;
	}
	.plot-root-container svg {
		display: block;
		width: 100%;
		height: auto;
	}
</style>
