<script>
	import { setContext, untrack } from 'svelte'
	import Violin from '../../src/geoms/Violin.svelte'

	let { state, ...rest } = $props()

	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Violin {...rest} />
</svg>
