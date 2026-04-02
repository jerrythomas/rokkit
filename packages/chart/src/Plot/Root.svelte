<script>
	import { setContext, untrack } from 'svelte'
	import { PlotState } from '../PlotState.svelte.js'
	import { defaultPreset } from '../lib/preset.js'

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
	} = $props()

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
