<script>
	import { setContext } from 'svelte'
	import Tooltip from '../../src/Plot/Tooltip.svelte'
	let { state, tooltip = true } = $props()
	setContext('plot-state', state)
</script>

<Tooltip {tooltip} />
