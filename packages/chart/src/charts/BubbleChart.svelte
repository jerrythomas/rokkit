<script lang="ts">
	import Plot from '../Plot.svelte'
	import Point from '../geoms/Point.svelte'

	type Row = Record<string, unknown>
	type Format = (v: unknown) => string
	type Method = string | number | { type: string; [k: string]: unknown }

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		color?: string
		symbol?: string
		size?: string
		alpha?: number
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		grid?: boolean
		legend?: boolean
		tooltip?: boolean | ((data: Row) => string)
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
		symbol: _symbol = undefined,
		size, // required: field name for bubble radius
		alpha = undefined,
		width = 600,
		height = 400,
		mode = undefined,
		grid = true,
		legend = false,
		tooltip = false,
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
	<Point {x} {y} {color} {size} {alpha} />
</Plot>
