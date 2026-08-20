<script>
	import { setContext, untrack } from 'svelte'
	import Legend from '../../src/Plot/Legend.svelte'
	let { state } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<Legend />
