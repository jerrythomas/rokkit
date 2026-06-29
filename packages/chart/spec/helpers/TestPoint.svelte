<script>
	import { setContext } from 'svelte'
	import Point from '../../src/Plot/Point.svelte'
	let { state, data, x, y, r = 4, fill = 'steelblue', stroke = 'white', strokeWidth = 1 } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Point {data} {x} {y} {r} {fill} {stroke} {strokeWidth} />
</svg>
