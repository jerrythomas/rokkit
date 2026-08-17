<script lang="ts">
	import Plot from '../Plot.svelte'
	import Area from '../geoms/Area.svelte'

	type Row = Record<string, unknown>
	type Method = string | number | { type: string; [k: string]: unknown }
	type Format = (v: unknown) => string

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		fill?: string
		stat?: string
		curve?: 'linear' | 'smooth' | 'step'
		pattern?: string
		/** @deprecated use `position="stack"`. */
		stack?: boolean
		/** Multi-series arrangement: 'stack' | 'fill' | 'identity' (default). */
		position?: 'stack' | 'fill' | 'identity'
		/** Fixed area opacity 0–1. */
		alpha?: number
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		grid?: boolean | 'x' | 'y' | 'both'
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
		fill = undefined,
		stat = 'identity',
		curve = undefined,
		pattern = undefined,
		stack = false,
		position = undefined,
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
	<Area {x} {y} color={fill} {pattern} {stat} {position} {alpha} options={{ curve, stack }} />
</Plot>
