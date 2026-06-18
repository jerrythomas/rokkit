<script lang="ts">
	import Plot from '../Plot.svelte'
	import Line from '../geoms/Line.svelte'

	type Row = Record<string, unknown>
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
		grid?: boolean
		legend?: boolean
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
		xFormat = undefined,
		yFormat = undefined,
		xTicks = undefined,
		yTicks = undefined,
		minorTicks = false
	}: Props = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend} {tooltip} {xFormat} {yFormat} {xTicks} {yTicks} {minorTicks}>
	<Line {x} {y} {color} {symbol} {label} {stat} options={{ curve }} />
</Plot>
