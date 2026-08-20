<script>
	import { setContext, untrack } from 'svelte'
	import Jitter from '../../src/geoms/Jitter.svelte'

	let { state, x = 'cat', y = 'val', fill = undefined, method = 'jitter', r = 2 } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Jitter {x} {y} {fill} {method} {r} />
</svg>
