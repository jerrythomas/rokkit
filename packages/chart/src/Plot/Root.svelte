<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import type { Snippet } from 'svelte'
	import { PlotState } from '../PlotState.svelte.js'
	import { defaultPreset } from '../lib/preset.js'

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
		mode = 'light',
		children
	}: Props = $props()

	const plotState = untrack(
		() =>
			new PlotState({
				data,
				channels: { x, y, color },
				width,
				height,
				margin,
				mode,
				chartPreset: defaultPreset
			})
	)

	$effect(() => {
		plotState.update({
			data,
			channels: { x, y, color },
			width,
			height,
			margin,
			mode,
			chartPreset: defaultPreset
		})
	})

	setContext('plot-state', plotState)

	const svgWidth = $derived(plotState.innerWidth + (margin?.left ?? 50) + (margin?.right ?? 30))
	const svgHeight = $derived(plotState.innerHeight + (margin?.top ?? 20) + (margin?.bottom ?? 40))
	const marginLeft = $derived(margin?.left ?? 50)
	const marginTop = $derived(margin?.top ?? 20)
</script>

<svg
	{width}
	{height}
	viewBox="0 0 {svgWidth} {svgHeight}"
	role="img"
	aria-label="Chart visualization"
	data-plot-root
>
	<g transform="translate({marginLeft}, {marginTop})" data-plot-canvas>
		{@render children?.()}
	</g>
</svg>
