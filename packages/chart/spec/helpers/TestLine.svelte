<script>
	import { setContext } from 'svelte'
	import Line from '../../src/Plot/Line.svelte'
	let { state, data, x, y, stroke = 'steelblue', strokeWidth = 2, curve } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Line {data} {x} {y} {stroke} {strokeWidth} {curve} />
</svg>
