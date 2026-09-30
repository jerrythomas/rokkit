<script>
	import { setContext, untrack } from 'svelte'
	import Contour from '../../src/geoms/Contour.svelte'

	let { state, ...rest } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Contour {...rest} />
</svg>
