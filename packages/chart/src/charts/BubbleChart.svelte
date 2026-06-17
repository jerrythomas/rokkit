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
		symbol: _symbol = undefined,
		size, // required: field name for bubble radius
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

<Plot {data} {width} {height} {mode} {grid} {legend} {xFormat} {yFormat} {xTicks} {yTicks} {minorTicks}>
	<Point {x} {y} {color} {size} />
</Plot>
