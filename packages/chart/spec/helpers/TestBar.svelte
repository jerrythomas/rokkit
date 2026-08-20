<script>
	import { setContext, untrack } from 'svelte'
	import Bar from '../../src/geoms/Bar.svelte'

	let {
		state,
		x = 'category',
		y = 'value',
		label = false,
		options = {},
		filterable = false,
		keyboard = false,
		onselect = undefined
	} = $props()

	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Bar {x} {y} {label} {options} {filterable} {keyboard} {onselect} />
</svg>
