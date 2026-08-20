<script>
	import { setContext, untrack } from 'svelte'
	import Candlestick from '../../src/geoms/Candlestick.svelte'

	let {
		state,
		x = 'date',
		color = undefined,
		fill = undefined,
		options = {}
	} = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Candlestick {x} {color} {fill} {options} />
</svg>
