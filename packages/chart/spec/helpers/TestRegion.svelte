<script>
	import { setContext, untrack } from 'svelte'
	import Region from '../../src/geoms/Region.svelte'

	let { state, ...rest } = $props()
	setContext(
		'plot-state',
		untrack(() => state)
	)
</script>

<svg>
	<Region {...rest} />
</svg>
