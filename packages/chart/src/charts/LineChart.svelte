<script lang="ts">
	import Plot from '../Plot.svelte'
	import Line from '../geoms/Line.svelte'

	type Row = Record<string, unknown>
	type Method = string | number | { type: string; [k: string]: unknown }
	type Format = (v: unknown) => string

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		color?: string
		stat?: string
		symbol?: string
		curve?: 'linear' | 'smooth' | 'step'
		label?: boolean | string | ((data: Row) => unknown)
		tooltip?: boolean | ((data: Row) => string)
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		grid?: boolean | 'x' | 'y' | 'both'
		legend?: boolean
		highlight?: 'first' | 'last' | 'min' | 'max' | number | ((row: Row, i: number) => boolean)
		trend?: Method | Method[]
		xFormat?: Format
		yFormat?: Format
		xTicks?: number
		yTicks?: number
		minorTicks?: boolean
		onselect?: (detail: unknown) => void
		selectable?: boolean
		selected?: Row[]
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		color = undefined,
		stat = 'identity',
		symbol = undefined,
		curve = undefined, // forwarded to Line options
		label = false,
		tooltip = false,
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		highlight = undefined,
		trend = undefined,
		xFormat = undefined,
		yFormat = undefined,
		xTicks = undefined,
		yTicks = undefined,
		minorTicks = false,
		onselect = undefined,
		selectable = false,
		selected = $bindable([])
	}: Props = $props()
</script>

<Plot
	{data}
	{x}
	{y}
	{width}
	{height}
	{mode}
	{grid}
	{legend}
	{tooltip}
	{highlight}
	{trend}
	{xFormat}
	{yFormat}
	{xTicks}
	{yTicks}
	{minorTicks}
	{onselect}
	{selectable}
	bind:selected
>
	<Line {x} {y} {color} {symbol} {label} {stat} options={{ curve }} />
</Plot>
