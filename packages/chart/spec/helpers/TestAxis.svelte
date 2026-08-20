<script>
	import { setContext, untrack } from 'svelte'
	import Axis from '../../src/Plot/Axis.svelte'

	let {
		state,
		type = 'x',
		label = '',
		ticks = 6,
		minorTicks = false,
		showLine = true,
		showTicks = true,
		showLabels = true
	} = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Axis {type} {label} {ticks} {minorTicks} {showLine} {showTicks} {showLabels} />
</svg>
