<script>
	import { setContext } from 'svelte'
	import Box from '../../src/geoms/Box.svelte'

	let { state, x = 'cat', y = 'val', fill = undefined, options = {} } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Box {x} {y} {fill} {options} />
</svg>
