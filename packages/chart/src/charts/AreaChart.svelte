<script lang="ts">
	import Plot from '../Plot.svelte'
	import Area from '../geoms/Area.svelte'

	type Row = Record<string, unknown>
	type Format = (v: unknown) => string

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		fill?: string
		stat?: string
		curve?: 'linear' | 'smooth' | 'step'
		pattern?: string
		stack?: boolean
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
		fill = undefined,
		stat = 'identity',
		curve = undefined,
		pattern = undefined,
		stack = false,
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
	<Area {x} {y} color={fill} {pattern} {stat} options={{ curve, stack }} />
</Plot>
