<script lang="ts">
	import Plot from '../Plot.svelte'
	import Bar from '../geoms/Bar.svelte'

	type Row = Record<string, unknown>
	type Format = (v: unknown) => string

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
		xFormat?: Format
		yFormat?: Format
		xTicks?: number
		yTicks?: number
		minorTicks?: boolean
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		fill = undefined, // mapped to color channel
		pattern = undefined,
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		stat = 'identity',
		stack = false,
		label = false,
		tooltip = false,
		xFormat = undefined,
		yFormat = undefined,
		xTicks = undefined,
		yTicks = undefined,
		minorTicks = false
	}: Props = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend} {tooltip} {xFormat} {yFormat} {xTicks} {yTicks} {minorTicks}>
	<Bar {x} {y} color={fill} {pattern} {label} {stat} options={{ stack }} />
</Plot>
