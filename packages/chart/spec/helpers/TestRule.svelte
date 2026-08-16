<script>
	import { setContext } from 'svelte'
	import Rule from '../../src/geoms/Rule.svelte'

	let { state, x = undefined, y = undefined, label = undefined, dash = '4 4' } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Rule {x} {y} {label} {dash} />
</svg>
