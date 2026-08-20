<script>
	import { setContext, untrack } from 'svelte'
	import Arc from '../../src/geoms/Arc.svelte'

	let { state, theta = 'hwy', color = 'class' } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Arc {theta} {color} />
</svg>
