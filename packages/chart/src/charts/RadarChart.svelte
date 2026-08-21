<script lang="ts">
	import Plot from '../Plot.svelte'
	import Radar from '../geoms/Radar.svelte'

	type Row = Record<string, unknown>

	type AxisSpec = {
		key: string
		label?: string
		unit?: string
		domain?: [number, number]
		ticks?: number
		tickLabels?: string[]
		format?: (value: number) => unknown
		weight?: number
	}

	type Props = {
		data?: Row[]
		/** Field naming which axis each row belongs to. */
		axis?: string
		/** Field holding the plotted magnitude. */
		value?: string
		/** Field distinguishing one polygon from another. */
		series?: string
		/** Axis order and per-axis config — bare names, full specs, or a mix. */
		axes?: (string | AxisSpec)[]
		pattern?: string
		grid?: boolean
		rings?: number
		sharedDomain?: boolean
		radiusScale?: 'linear' | 'sqrt' | 'auto'
		alpha?: number
		stat?: string
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		title?: string
		tooltip?: boolean | ((data: Row) => string)
		/** Omit to let it default: on for 2+ series, off for one. */
		legend?: boolean
		/** Plot-level selection: receives the `buildSelectDetail` shape, not a bare row —
		 *  same as AreaChart/BarChart. The geom's own `onselect` (a row) is reached by
		 *  composing `<Plot><Radar onselect /></Plot>` directly. */
		onselect?: (detail: unknown) => void
	}

	let {
		data = [],
		axis = undefined,
		value = undefined,
		series = undefined,
		axes = undefined,
		pattern = undefined,
		grid = true,
		rings = undefined,
		sharedDomain = undefined,
		radiusScale = undefined,
		alpha = undefined,
		stat = 'identity',
		width = 400,
		height = 400,
		mode = undefined,
		title = undefined,
		tooltip = false,
		legend = undefined,
		onselect = undefined
	}: Props = $props()

	// ⚠ Diverges from PieChart, which defaults `legend` to false. Radar fills are washed out
	// (preset alpha 0.25) and they overlap, so where they intersect the blend is a colour
	// that belongs to neither series — matching a polygon to its series by colour alone is
	// unreliable. A legend is therefore on by default as soon as there is more than one
	// series. Still fully overridable in both directions.
	//
	// With no `series` channel there is exactly one polygon by construction, so the count
	// cannot exceed one and the legend is simply off — no need to distinguish empty data
	// from one implicit series.
	const multiSeries = $derived(series ? new Set(data.map((row) => row[series])).size > 1 : false)
	const showLegend = $derived(legend ?? multiSeries)
</script>

<Plot
	{data}
	{width}
	{height}
	{mode}
	{title}
	grid={false}
	axes={false}
	margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
	legend={showLegend}
	{tooltip}
	{onselect}
>
	<Radar
		{axis}
		{value}
		{series}
		{axes}
		{pattern}
		{alpha}
		{stat}
		options={{ grid, rings, sharedDomain, radiusScale }}
	/>
</Plot>
