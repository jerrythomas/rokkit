<script lang="ts">
	/**
	 * Every edge, or only the ones that climb (#167).
	 *
	 * A toggle: on a real codebase the conformant edges are the vast majority and drown the
	 * signal, so "only violations" is the view a reviewer actually reads.
	 */
	import ToggleControl from './ToggleControl.svelte'
	import { say } from '../messages.js'

	type Props = {
		showEdges?: 'all' | 'violations'
		onchange?: (value: 'all' | 'violations') => void
	}

	let { showEdges = 'all', onchange }: Props = $props()

	const only = $derived(showEdges === 'violations')
</script>

<ToggleControl
	pressed={only}
	hooks={{ 'data-graph-violations': showEdges }}
	label={say(only ? 'violationsOnly' : 'allEdges')}
	title={say(only ? 'violationsOnlyTitle' : 'allEdgesTitle')}
	onchange={(on) => onchange?.(on ? 'violations' : 'all')}
/>
