<script lang="ts">
	import Plot from '../Plot.svelte'
	import Bar from '../geoms/Bar.svelte'

	type Row = Record<string, unknown>
	type Format = (v: unknown) => string
	type Method = string | number | { type: string; [k: string]: unknown }

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		fill?: string
		pattern?: string
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		grid?: boolean
		legend?: boolean
		stat?: string
		stack?: boolean
		label?: boolean | string | ((data: Row) => unknown)
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
		fill = undefined, // mapped to color channel
		pattern = undefined,
		width = 600,
		height = 400,
		mode = undefined,
		grid = true,
		legend = false,
		stat = 'identity',
		stack = false,
		label = false,
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
	<Bar {x} {y} color={fill} {pattern} {label} {stat} options={{ stack }} />
</Plot>
