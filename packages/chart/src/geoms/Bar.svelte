<script>
	import { getContext, onMount, onDestroy } from 'svelte'
	import { buildGroupedBars, buildStackedBars, buildHorizontalBars } from './lib/bars.js'
	import { keyboardNav } from '../lib/keyboard-nav.js'
	import LabelPill from './LabelPill.svelte'

	let {
		x,
		y,
		color,
		fill: fillProp,
		pattern,
		label = false,
		stat = 'identity',
		options = {},
		filterable = false,
		onselect = undefined,
		keyboard = false
	} = $props()

	// `fill` is accepted as an alias for `color` (consistent with Arc.svelte)
	const colorChannel = $derived(fillProp ?? color)

	/**
	 * @param {Record<string, unknown>} data
	 * @param {string} defaultField
	 * @returns {string | null}
	 */
	function resolveLabel(data, defaultField) {
		if (!label) return null
		if (label === true) return String(data[defaultField] ?? '')
		if (typeof label === 'function') return String(label(data) ?? '')
		if (typeof label === 'string') return String(data[label] ?? '')
		return null
	}

	/**
	 * Pick white or dark text based on perceived luminance of a hex fill color.
	 * @param {string | undefined} hex
	 * @returns {string}
	 */
	function contrastColor(hex) {
		if (!hex || !hex.startsWith('#') || hex.length < 7) return 'white'
		const r = parseInt(hex.slice(1, 3), 16) / 255
		const g = parseInt(hex.slice(3, 5), 16) / 255
		const b = parseInt(hex.slice(5, 7), 16) / 255
		return 0.299 * r + 0.587 * g + 0.114 * b > 0.55 ? '#333' : 'white'
	}

	const plotState = getContext('plot-state')
	const cf = getContext('crossfilter')
	let id = $state(null)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'bar',
			channels: { x, y, color: colorChannel, pattern },
			stat,
			options: { stack: options?.stack ?? false }
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id)
			plotState.updateGeom(id, {
				channels: { x, y, color: colorChannel, pattern },
				stat,
				options: { stack: options?.stack ?? false }
			})
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)
	const patterns = $derived(plotState.patterns)
	const effectiveOrientation = $derived(options.orientation ?? plotState.orientation)
	const innerHeight = $derived(plotState.innerHeight)

	const bars = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const channels = { x, y, color: colorChannel, pattern }
		if (effectiveOrientation === 'horizontal') {
			return buildHorizontalBars(data, channels, xScale, yScale, colors, innerHeight)
		}
		if (options.stack) {
			return buildStackedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
		}
		return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
	})

	/** @type {Record<string, boolean>} */
	let dimmedByKey = $state({})

	$effect(() => {
		if (!cf) {
			dimmedByKey = {}
			return
		}
		// cf.version is a $state counter that increments on every filter mutation.
		// Reading it here establishes a reactive dependency so the effect re-runs
		// whenever any filter changes — including changes from sibling FilterBars.
		void cf.version
		const next = /** @type {Record<string, boolean>} */ ({})
		for (const bar of bars) {
			const dimmedByX = x ? cf.isDimmed(x, bar.data[x]) : false
			const dimmedByY = y ? cf.isDimmed(y, bar.data[y]) : false
			next[bar.key] = dimmedByX || dimmedByY
		}
		dimmedByKey = next
	})

	function handleBarClick(barX) {
		if (!filterable || !x || !cf) return
		cf.toggleCategorical(x, barX)
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
				stroke={bar.stroke ?? 'none'}
				stroke-width={bar.stroke ? 0.5 : 0}
				data-plot-element="bar"
				data-plot-value={bar.data[y]}
				data-plot-category={bar.data[x]}
				data-dimmed={dimmedByKey[bar.key] ? true : undefined}
				style:cursor={filterable || onselect ? 'pointer' : undefined}
				onclick={filterable && x ? () => { handleBarClick(bar.data[x]); onselect?.(bar.data) } : onselect ? () => onselect(bar.data) : undefined}
				onkeydown={filterable && x
					? (e) => (e.key === 'Enter' || e.key === ' ') && handleBarClick(bar.data[x])
					: onselect ? (e) => (e.key === 'Enter' || e.key === ' ') && onselect(bar.data) : undefined}
				role={filterable || onselect || keyboard ? 'button' : 'graphics-symbol'}
				tabindex={filterable || onselect || keyboard ? 0 : undefined}
				use:keyboardNav={keyboard}
				aria-label="{bar.data[x]}: {bar.data[y]}"
				onmouseenter={() => plotState.setHovered(bar.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{bar.data[x]}: {bar.data[y]}</title>
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
