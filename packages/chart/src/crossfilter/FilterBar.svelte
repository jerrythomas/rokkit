<script lang="ts">
	import PlotChart from '../Plot.svelte'
	import Bar from '../geoms/Bar.svelte'
	import type { PlotSpec } from '../lib/plot/types.js'

	type Props = {
		data?: Record<string, unknown>[]
		field?: string
		valueField?: string
		stat?: string
		width?: number
		height?: number
		mode?: 'light' | 'dark'
	}

	let {
		data = [],
		field,
		valueField,
		stat = 'sum',
		width = 300,
		height = 120,
		mode = 'light'
	}: Props = $props()

	const spec = $derived<PlotSpec>({
		x: field,
		y: valueField
	})
</script>

<!-- FilterBar must be used inside a <CrossFilter> parent. Does not create its own context. -->
<PlotChart {data} {spec} {width} {height} {mode} grid={false} legend={false}>
	<Bar x={field} y={valueField} {stat} filterable={true} />
</PlotChart>
