<script lang="ts">
	/**
	 * Every pair, or only the hidden coupling (#169).
	 *
	 * A toggle: on a real repo the ordinary pairs vastly outnumber the ones nothing in the code
	 * explains, and those are the only rows anyone acts on.
	 */
	import ToggleControl from './ToggleControl.svelte'
	import { say } from '../messages.js'

	type Props = {
		showEdges?: 'all' | 'hidden'
		onchange?: (value: 'all' | 'hidden') => void
	}

	let { showEdges = 'all', onchange }: Props = $props()

	const only = $derived(showEdges === 'hidden')
</script>

<ToggleControl
	pressed={only}
	hooks={{ 'data-graph-hidden-only': showEdges }}
	label={say(only ? 'hiddenOnly' : 'allPairs')}
	title={say(only ? 'hiddenOnlyTitle' : 'allPairsTitle')}
	onchange={(on) => onchange?.(on ? 'hidden' : 'all')}
/>
