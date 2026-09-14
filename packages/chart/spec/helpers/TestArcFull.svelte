<script>
	import { setContext, untrack } from 'svelte'
	import Arc from '../../src/geoms/Arc.svelte'

	let { state, ...rest } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Arc {...rest} />
</svg>
