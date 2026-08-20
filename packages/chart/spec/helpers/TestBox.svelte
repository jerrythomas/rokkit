<script>
	import { setContext, untrack } from 'svelte'
	import Box from '../../src/geoms/Box.svelte'

	let { state, x = undefined, y = undefined, fill = undefined, options = {} } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Box {x} {y} {fill} {options} />
</svg>
