<script>
	import { setContext, untrack } from 'svelte'
	import Line from '../../src/geoms/Line.svelte'

	let { state, ...rest } = $props()

	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Line {...rest} />
</svg>
