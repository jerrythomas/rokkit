<script lang="ts">
	/**
	 * Every pair, or only the hidden coupling (#169).
	 *
	 * A toggle: on a real repo the ordinary pairs vastly outnumber the ones nothing in the code
	 * explains, and those are the only rows anyone acts on.
	 */
	type Props = {
		showEdges?: 'all' | 'hidden'
		onchange?: (value: 'all' | 'hidden') => void
	}

	let { showEdges = 'all', onchange }: Props = $props()

	const only = $derived(showEdges === 'hidden')
</script>

<button
	type="button"
	data-graph-hidden-only={showEdges}
	aria-pressed={only}
	title={only ? 'Showing only coupling no import explains' : 'Showing every pair'}
	onclick={() => onchange?.(only ? 'all' : 'hidden')}
>
	<span data-graph-control-label>{only ? 'Hidden only' : 'All pairs'}</span>
</button>
