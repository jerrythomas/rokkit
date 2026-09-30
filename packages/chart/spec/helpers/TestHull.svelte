<script>
	import { setContext, untrack } from 'svelte'
	import Hull from '../../src/geoms/Hull.svelte'

	let { state, ...rest } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Hull {...rest} />
</svg>
