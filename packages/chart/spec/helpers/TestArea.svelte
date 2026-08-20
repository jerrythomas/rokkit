<script>
	import { setContext, untrack } from 'svelte'
	import Area from '../../src/geoms/Area.svelte'

	let { state, x = 'x', y = 'y', options = {} } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Area {x} {y} {options} />
</svg>
