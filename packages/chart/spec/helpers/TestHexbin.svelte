<script>
	import { setContext } from 'svelte'
	import Hexbin from '../../src/geoms/Hexbin.svelte'

	let { state, x = 'px', y = 'py', color = undefined, fill = undefined, options = {} } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Hexbin {x} {y} {color} {fill} {options} />
</svg>
