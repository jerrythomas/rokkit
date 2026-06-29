<script>
	import { setContext } from 'svelte'
	import Area from '../../src/Plot/Area.svelte'
	let { state, data, x, y, y0, fill = 'steelblue', opacity = 0.7, curve } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Area {data} {x} {y} {y0} {fill} {opacity} {curve} />
</svg>
