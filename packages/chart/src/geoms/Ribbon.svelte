<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildRibbonMarks } from './lib/marks/ribbon.js'

	type Options = {
		source?: string
		target?: string
		value?: string
	}

	type Props = {
		x?: string
		y?: string
		color?: string
		fill?: string
		/** Fixed ribbon opacity 0–1; defaults to the per-geom preset (ribbon = 0.5). */
		alpha?: number
		stat?: string
		options?: Options
	}

	let { x, y, color, fill, alpha, stat = 'identity', options = {} }: Props = $props()

	const colorField = $derived(fill ?? color)
	const sourceField = $derived(options.source ?? 'source')
	const targetField = $derived(options.target ?? 'target')
	const valueField = $derived(options.value ?? 'value')
	const plotState = getContext<PlotState>('plot-state')

	const geom = new GeomState(plotState, () => ({
		type: 'ribbon',
		channels: { x, y, color: colorField },
		stat,
		options,
		alpha,
		build: buildRibbonMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	// GeomState returns [] for empty data; buildRibbonMarks otherwise returns
	// { links, sourceNodes, targetNodes } — normalize each to an array.
	const marks = $derived(geom.marks)
	const links = $derived(marks?.links ?? [])
	const sourceNodes = $derived(marks?.sourceNodes ?? [])
	const targetNodes = $derived(marks?.targetNodes ?? [])
</script>

{#if links.length > 0}
	<g data-plot-geom="ribbon">
		{#each links as link (link.key)}
			<path
				d={link.d}
				fill={link.fill}
				opacity={link.alpha}
				data-plot-element="ribbon"
				role="img"
				onmouseenter={() => plotState.setHovered(link.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{link.data[sourceField]} → {link.data[targetField]}: {link.data[valueField]}</title>
			</path>
		{/each}
		<!-- Source node labels -->
		{#each sourceNodes as node (node.name)}
			<text
				x="-4"
				y={node.y + node.height / 2}
				text-anchor="end"
				dominant-baseline="middle"
				font-size="11"
				fill="currentColor"
				data-plot-element="node-label"
			>{node.name}</text>
		{/each}
		<!-- Target node labels -->
		{#each targetNodes as node (node.name)}
			<text
				x={plotState.innerWidth + 4}
				y={node.y + node.height / 2}
				text-anchor="start"
				dominant-baseline="middle"
				font-size="11"
				fill="currentColor"
				data-plot-element="node-label"
			>{node.name}</text>
		{/each}
	</g>
{/if}
