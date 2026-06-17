<script lang="ts">
	import Plot from '../Plot.svelte'
	import Point from '../geoms/Point.svelte'

	type Row = Record<string, unknown>
	type Format = (v: unknown) => string

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		color?: string
		symbol?: string
		size?: string
		label?: boolean | string | ((data: Row) => unknown)
		tooltip?: boolean | ((data: Row) => string)
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		grid?: boolean
		legend?: boolean
		jitter?: { width?: number; height?: number } | null
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
		symbol = undefined,
		size = undefined,
		label = false,
		tooltip = false,
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		jitter = undefined,
		xFormat = undefined,
		yFormat = undefined,
		xTicks = undefined,
		yTicks = undefined,
		minorTicks = false
	}: Props = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend} {tooltip} {xFormat} {yFormat} {xTicks} {yTicks} {minorTicks}>
	<Point {x} {y} {color} {size} {symbol} {label} options={{ jitter }} />
</Plot>
