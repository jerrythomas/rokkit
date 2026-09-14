<script>
	import { setContext, untrack } from 'svelte'
	import Point from '../../src/geoms/Point.svelte'

	let { state, ...rest } = $props()

	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Point {...rest} />
</svg>
