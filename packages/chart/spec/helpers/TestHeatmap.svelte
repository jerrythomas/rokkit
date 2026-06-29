<script>
	import { setContext } from 'svelte'
	import Heatmap from '../../src/geoms/Heatmap.svelte'

	let { state, x = 'col', y = 'row', color = undefined, fill = undefined, options = {} } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Heatmap {x} {y} {color} {fill} {options} />
</svg>
