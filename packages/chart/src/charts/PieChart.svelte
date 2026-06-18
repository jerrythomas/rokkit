<script lang="ts">
	import Plot from '../Plot.svelte'
	import Arc from '../geoms/Arc.svelte'

	type Row = Record<string, unknown>

	type Props = {
		data?: Row[]
		label?: string
		y?: string
		fill?: string
		pattern?: string
		innerRadius?: number
		labelFn?: (data: Row) => string
		tooltip?: boolean | ((data: Row) => string)
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		legend?: boolean
		stat?: string
	}

	let {
		data = [],
		label = undefined,
		y = undefined,
		fill = undefined,
		pattern = undefined,
		innerRadius = 0,
		labelFn = undefined,
		tooltip = false,
		width = 400,
		height = 400,
		mode = 'light',
		legend = false,
		stat = 'sum'
	}: Props = $props()
</script>

<Plot
	{data}
	{width}
	{height}
	{mode}
	grid={false}
	axes={false}
	margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
	{legend}
	{tooltip}
>
	<Arc theta={y} fill={label ?? fill} {pattern} {labelFn} {stat} options={{ innerRadius }} />
</Plot>
