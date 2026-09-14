<script>
	import { setContext, untrack } from 'svelte'
	import Highlight from '../../src/geoms/Highlight.svelte'

	let { state, ...rest } = $props()

	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Highlight {...rest} />
</svg>
