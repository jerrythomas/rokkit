<script>
	import { setContext, untrack } from 'svelte'
	import Waterfall from '../../src/geoms/Waterfall.svelte'

	let {
		state,
		x = 'label',
		y = 'value',
		color = undefined,
		fill = undefined,
		options = {}
	} = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Waterfall {x} {y} {color} {fill} {options} />
</svg>
