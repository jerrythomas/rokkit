<script>
	import { setContext, untrack } from 'svelte'
	import Radar from '../../src/geoms/Radar.svelte'

	let {
		state,
		axes = undefined,
		axis = undefined,
		value = undefined,
		series = undefined,
		pattern = undefined,
		alpha = undefined,
		stat = 'identity',
		options = {},
		onselect = undefined
	} = $props()

	setContext(
		'plot-state',
		untrack(() => state)
	)
</script>

<svg>
	<Radar {axes} {axis} {value} {series} {pattern} {alpha} {stat} {options} {onselect} />
</svg>
