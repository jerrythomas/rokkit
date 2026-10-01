<script lang="ts">
	/**
	 * Every edge, or only the ones that climb (#167).
	 *
	 * A toggle: on a real codebase the conformant edges are the vast majority and drown the
	 * signal, so "only violations" is the view a reviewer actually reads.
	 */
	type Props = {
		showEdges?: 'all' | 'violations'
		onchange?: (value: 'all' | 'violations') => void
	}

	let { showEdges = 'all', onchange }: Props = $props()

	const only = $derived(showEdges === 'violations')
</script>

<button
	type="button"
	data-graph-violations={showEdges}
	aria-pressed={only}
	title={only ? 'Showing only the edges that climb a layer' : 'Showing every edge'}
	onclick={() => onchange?.(only ? 'all' : 'violations')}
>
	<span data-graph-control-label>{only ? 'Violations only' : 'All edges'}</span>
</button>
