<script>
	import { setContext, untrack } from 'svelte'
	import Ribbon from '../../src/geoms/Ribbon.svelte'

	let { state, x = undefined, y = undefined, color = undefined, fill = undefined, options = {} } =
		$props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Ribbon {x} {y} {color} {fill} {options} />
</svg>
