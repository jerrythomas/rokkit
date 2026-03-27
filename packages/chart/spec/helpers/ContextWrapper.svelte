<script>
	import { setContext } from 'svelte'

	let { state, children } = $props()
	setContext('plot-state', state)
</script>

{@render children()}
