<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildArcMarks } from './lib/marks/arc.js'

	type Row = Record<string, unknown>

	type Props = {
		theta?: string
		/** Slice interior aesthetic (field). */
		fill?: string
		/** Accepted as an alias for `fill`. */
		color?: string
		pattern?: string
		/** Fixed slice opacity 0–1; defaults to the per-geom preset (arc = 1). */
		alpha?: number
		stat?: string
		labelFn?: (data: Row) => string
		options?: { innerRadius?: number }
		onselect?: (data: Row) => void
	}

	let {
		theta,
		fill,
		color,
		pattern,
		alpha,
		labelFn = undefined,
		stat = 'identity',
		options = {},
		onselect = undefined
	}: Props = $props()

	const plotState = getContext<PlotState>('plot-state')

	const geom = new GeomState(plotState, () => ({
		type: 'arc',
		channels: { y: theta, color, fill, pattern },
		stat,
		options: { innerRadius: options.innerRadius ?? 0 },
		alpha,
		build: buildArcMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const arcs = $derived(geom.marks)
	const w = $derived(plotState.innerWidth)
	const h = $derived(plotState.innerHeight)
</script>

{#if arcs.length > 0}
	<g data-plot-geom="arc" transform="translate({w / 2}, {h / 2})">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		{#each arcs as arc (arc.key)}
			<path
				d={arc.d}
				fill={arc.fill}
				fill-opacity={arc.alpha}
				stroke={arc.stroke}
				stroke-width="1"
				role={onselect ? 'button' : 'presentation'}
				tabindex={onselect ? 0 : undefined}
				style:cursor={onselect ? 'pointer' : undefined}
				data-plot-element="arc"
				onmouseenter={() => plotState.setHovered({ ...arc.data, '%': `${arc.pct}%` })}
				onmouseleave={() => plotState.clearHovered()}
				onclick={onselect ? () => onselect({ ...arc.data, '%': `${arc.pct}%` }) : undefined}
				onkeydown={onselect ? (e) => (e.key === 'Enter' || e.key === ' ') && onselect({ ...arc.data, '%': `${arc.pct}%` }) : undefined}
			/>
			{#if arc.patternId}
				<path
					d={arc.d}
					fill="url(#{arc.patternId})"
					stroke={arc.stroke}
					stroke-width="1"
					pointer-events="none"
					data-plot-element="arc"
				/>
			{/if}
			{#if arc.pct >= 5}
				{@const labelText = labelFn ? String(labelFn(arc.data) ?? '') : `${arc.pct}%`}
				{#if labelText}
					{@const lw = Math.max(36, labelText.length * 7 + 12)}
					<g
						transform="translate({arc.centroid[0]},{arc.centroid[1]})"
						pointer-events="none"
						data-plot-element="arc-label"
					>
						<rect x={-lw / 2} y="-9" width={lw} height="18" rx="4" fill="white" fill-opacity="0.82" />
						<text
							text-anchor="middle"
							dominant-baseline="central"
							font-size="11"
							font-weight="600"
							fill={arc.stroke}>{labelText}</text
						>
					</g>
				{/if}
			{/if}
		{/each}
	</g>
{/if}
