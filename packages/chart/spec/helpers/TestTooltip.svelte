<script>
	import { setContext, untrack } from 'svelte'
	import Tooltip from '../../src/Plot/Tooltip.svelte'
	let { state, tooltip = true } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<Tooltip {tooltip} />
