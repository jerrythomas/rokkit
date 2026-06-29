<script>
	import { setContext } from 'svelte'
	import Bar from '../../src/Plot/Bar.svelte'
	let { state, data, x, y, fill = 'steelblue', opacity = 1 } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Bar {data} {x} {y} {fill} {opacity} />
</svg>
