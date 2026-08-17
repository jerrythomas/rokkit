<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import type { createCrossFilter } from '../crossfilter/createCrossFilter.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildBarMarks } from './lib/marks/bar.js'
	import { keyboardNav } from '../lib/keyboard-nav.js'
	import { buildSelectDetail } from '../lib/select.js'
	import LabelPill from './LabelPill.svelte'

	type Row = Record<string, unknown>
	type CrossFilter = ReturnType<typeof createCrossFilter>
	type Options = {
		/** @deprecated use `position="stack"` — kept as an alias. */
		stack?: boolean
		orientation?: 'horizontal' | 'vertical'
		labelInside?: boolean
		labelOffset?: number
	}

	type Props = {
		x?: string
		y?: string
		/** Border/outline aesthetic (field). */
		color?: string
		/** Interior aesthetic (field); falls back to `color`. */
		fill?: string
		pattern?: string
		/** Multi-series arrangement: 'stack' | 'dodge' (default) | 'fill' (100%) | 'identity' (overlap). */
		position?: 'stack' | 'dodge' | 'fill' | 'identity'
		/** Sub-series field for stack/dodge; defaults to `fill ?? color`. */
		group?: string
		/** Fixed bar opacity 0–1; defaults to the per-geom preset (bar = 1). */
		alpha?: number
		label?: boolean | string | ((data: Row) => unknown)
		stat?: string
		options?: Options
		filterable?: boolean
		onselect?: (data: Row) => void
		keyboard?: boolean
	}

	let {
		x,
		y,
		color,
		fill,
		pattern,
		position,
		group,
		alpha,
		label = false,
		stat = 'identity',
		options = {},
		filterable = false,
		onselect = undefined,
		keyboard = false
	}: Props = $props()

	// `options.stack: true` is the back-compat alias for position='stack'.
	const resolvedPosition = $derived(position ?? (options?.stack ? 'stack' : 'dodge'))

	function resolveLabel(data: Row, defaultField: string | undefined): string | null {
		if (!label) return null
		if (label === true) return String((defaultField ? data[defaultField] : undefined) ?? '')
		if (typeof label === 'function') return String(label(data) ?? '')
		if (typeof label === 'string') return String(data[label] ?? '')
		return null
	}

	/**
	 * Pick white or dark text based on perceived luminance of a hex fill color.
	 */
	function contrastColor(hex: string | undefined): string {
		if (!hex || !hex.startsWith('#') || hex.length < 7) return 'white'
		const r = parseInt(hex.slice(1, 3), 16) / 255
		const g = parseInt(hex.slice(3, 5), 16) / 255
		const b = parseInt(hex.slice(5, 7), 16) / 255
		return 0.299 * r + 0.587 * g + 0.114 * b > 0.55 ? '#333' : 'white'
	}

	const plotState = getContext<PlotState>('plot-state')
	const cf = getContext<CrossFilter | undefined>('crossfilter')

	const geom = new GeomState(plotState, () => ({
		type: 'bar',
		channels: { x, y, color, fill, pattern, group },
		stat,
		options: { stack: options?.stack ?? false, position: resolvedPosition },
		alpha,
		build: buildBarMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const bars = $derived(geom.marks)
	const effectiveOrientation = $derived(options.orientation ?? plotState.orientation)
	const seriesField = $derived(fill ?? color)

	let dimmedByKey = $state<Record<string, boolean>>({})

	$effect(() => {
		if (!cf) {
			dimmedByKey = {}
			return
		}
		// cf.version is a $state counter that increments on every filter mutation.
		// Reading it here establishes a reactive dependency so the effect re-runs
		// whenever any filter changes — including changes from sibling FilterBars.
		void cf.version
		const next: Record<string, boolean> = {}
		for (const bar of bars) {
			const dimmedByX = x ? cf.isDimmed(x, bar.data[x]) : false
			const dimmedByY = y ? cf.isDimmed(y, bar.data[y]) : false
			next[bar.key] = dimmedByX || dimmedByY
		}
		dimmedByKey = next
	})

	function handleBarClick(barX: unknown) {
		if (!filterable || !x || !cf) return
		cf.toggleCategorical(x, barX)
	}

	function selectBar(bar: { data: Row }, event: MouseEvent | KeyboardEvent) {
		if (plotState.interactive)
			plotState.handleSelect(
				buildSelectDetail(
					bar.data,
					plotState.data.indexOf(bar.data),
					{ x, y },
					'bar',
					seriesField ? bar.data[seriesField] : undefined,
					event
				)
			)
	}

	function handleBarActivate(bar: { data: Row }, event: MouseEvent) {
		if (filterable && x) handleBarClick(bar.data[x])
		onselect?.(bar.data)
		selectBar(bar, event)
	}

	function handleBarKeyActivate(bar: { data: Row }, event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return
		if (filterable && x) {
			handleBarClick(bar.data[x])
		} else {
			onselect?.(bar.data)
		}
		selectBar(bar, event)
	}
</script>

{#if bars.length > 0}
	<g data-plot-geom="bar">
		{#each bars as bar (bar.key)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<rect
				x={bar.x}
				y={bar.y}
				width={Math.max(0, bar.width)}
				height={Math.max(0, bar.height)}
				fill={bar.fill}
				fill-opacity={bar.alpha}
				stroke={bar.stroke ?? 'none'}
				stroke-width={bar.stroke ? 0.5 : 0}
				data-plot-element="bar"
				data-plot-value={bar.data[y ?? '']}
				data-plot-category={bar.data[x ?? '']}
				data-dimmed={dimmedByKey[bar.key] ? true : undefined}
				style:cursor={filterable || onselect || plotState.interactive ? 'pointer' : undefined}
				onclick={filterable || onselect || keyboard || plotState.interactive
					? (e) => handleBarActivate(bar, e)
					: undefined}
				onkeydown={filterable || onselect || keyboard || plotState.interactive
					? (e) => handleBarKeyActivate(bar, e)
					: undefined}
				role={filterable || onselect || keyboard || plotState.interactive ? 'button' : 'graphics-symbol'}
				tabindex={filterable || onselect || keyboard || plotState.interactive ? 0 : undefined}
				use:keyboardNav={keyboard}
				aria-label="{bar.data[x ?? '']}: {bar.data[y ?? '']}"
				onmouseenter={() => plotState.setHovered(bar.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{bar.data[x ?? '']}: {bar.data[y ?? '']}</title>
			</rect>
			{#if bar.patternId}
				<rect
					x={bar.x}
					y={bar.y}
					width={Math.max(0, bar.width)}
					height={Math.max(0, bar.height)}
					fill="url(#{bar.patternId})"
					pointer-events="none"
				/>
			{/if}
			{#if label}
				{@const text = resolveLabel(bar.data, effectiveOrientation === 'horizontal' ? x : y)}
				{#if text}
					{#if effectiveOrientation === 'horizontal'}
						{#if options.labelInside}
							{@const estimatedWidth = text.length * 7 + 16}
							{@const fitsInside = bar.width >= estimatedWidth}
							<text
								x={fitsInside ? bar.x + bar.width - 8 : bar.x + bar.width + 6}
								y={bar.y + bar.height / 2}
								dominant-baseline="central"
								text-anchor={fitsInside ? 'end' : 'start'}
								font-size="11"
								font-weight="600"
								fill={fitsInside ? contrastColor(bar.fill) : (bar.stroke ?? '#555')}
								pointer-events="none"
								data-plot-element="label"
							>{text}</text>
						{:else}
							<LabelPill
								x={bar.x + bar.width + (options.labelOffset ?? 8)}
								y={bar.y + bar.height / 2}
								{text}
								color={bar.stroke ?? '#333'}
							/>
						{/if}
					{:else}
						<LabelPill
							x={bar.x + bar.width / 2}
							y={bar.y + (options.labelOffset ?? -8)}
							{text}
							color={bar.stroke ?? '#333'}
						/>
					{/if}
				{/if}
			{/if}
		{/each}
	</g>
{/if}
