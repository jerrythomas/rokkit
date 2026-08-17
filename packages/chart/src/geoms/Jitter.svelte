<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildJitterMarks } from './lib/marks/jitter.js'

	type Props = {
		x?: string
		y?: string
		/** Point interior aesthetic (field); defaults to `x`. */
		fill?: string
		/** Outline aesthetic (field); overrides the point stroke when set. */
		color?: string
		r?: number
		method?: 'jitter' | 'swarm'
		/** Confine points to one half of the band (raincloud/split plots). Default 'center'. */
		side?: 'left' | 'right' | 'center'
		/** Fixed point opacity 0–1; defaults to the per-geom preset (jitter = 0.8). */
		alpha?: number
	}

	let { x, y, fill, color, r = 2, method = 'jitter', side = 'center', alpha }: Props = $props()

	const plotState = getContext<PlotState>('plot-state')

	// Fall back to the root Plot channels when the geom omits x/y (composes under
	// <Plot.Root x y> without silently NaN-ing).
	const xf = $derived(x ?? plotState.channels?.x)
	const yf = $derived(y ?? plotState.channels?.y)
	// fill ?? effective-x drives the color lookup
	const fillChannel = $derived(fill ?? xf)

	const geom = new GeomState(plotState, () => ({
		type: 'jitter',
		channels: { x: xf, y: yf, fill: fillChannel, color },
		stat: 'identity',
		options: { method, r, side },
		alpha,
		build: buildJitterMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const points = $derived(geom.marks)
</script>

{#if points.length > 0}
	<g data-plot-geom="jitter">
		{#each points as pt, i (`${String(pt.cx)}::${i}`)}
			<circle
				cx={pt.cx}
				cy={pt.cy}
				{r}
				fill={pt.fill}
				fill-opacity={pt.alpha}
				stroke={pt.stroke}
				stroke-width="0.5"
				data-plot-element="jitter-point"
				role="graphics-symbol"
				aria-label={`(${String(pt.data[xf ?? ''])}, ${String(pt.data[yf ?? ''])})`}
				onmouseenter={() => plotState.setHovered(pt.data)}
				onmouseleave={() => plotState.clearHovered()}
			/>
		{/each}
	</g>
{/if}
