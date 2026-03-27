<script>
	import { setContext } from 'svelte'
	import Legend from '../../src/Plot/Legend.svelte'
	let { state } = $props()
	setContext('plot-state', state)
</script>

<Legend />
