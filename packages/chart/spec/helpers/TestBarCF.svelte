<script>
	import { setContext, untrack } from 'svelte'
	import CrossFilter from '../../src/crossfilter/CrossFilter.svelte'
	import Bar from '../../src/geoms/Bar.svelte'

	let {
		state,
		x = 'category',
		y = 'value',
		filterable = true,
		crossfilter: externalCf = undefined
	} = $props()

	setContext('plot-state', untrack(() => state))
</script>

<CrossFilter crossfilter={externalCf}>
	<svg>
		<Bar {x} {y} {filterable} />
	</svg>
</CrossFilter>
