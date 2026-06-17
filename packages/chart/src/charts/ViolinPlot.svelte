<script lang="ts">
	import Plot from '../Plot.svelte'
	import Violin from '../geoms/Violin.svelte'

	type Row = Record<string, unknown>

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		fill?: string
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		grid?: boolean
		legend?: boolean
		yFormat?: (v: unknown) => string
		yTicks?: number
		minorTicks?: boolean
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		fill = undefined,
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		yFormat = undefined,
		yTicks = undefined,
		minorTicks = false
	}: Props = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend} {yFormat} {yTicks} {minorTicks}>
	<Violin {x} {y} {fill} />
</Plot>
