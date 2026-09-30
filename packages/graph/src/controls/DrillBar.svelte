<script lang="ts">
	/**
	 * Where the reader has drilled to, and the way back (#165).
	 *
	 * Breadcrumbs from the root to the current level (each an ancestor to climb to), a status
	 * while the host loads a level, the error when a load fails, and "Open" for the selected box
	 * when it can be drilled — the keyboard route into a leaf, since Enter on a leaf selects it.
	 * Renders nothing when there is nothing to show. Reads and calls the state; computes nothing.
	 */
	import type { GraphState } from '../GraphState.svelte.js'

	type Props = {
		state: GraphState
		/** What the root crumb says. */
		rootLabel?: string
	}

	let { state: graph, rootLabel = 'All' }: Props = $props()

	const message = (error: unknown) => (error instanceof Error ? error.message : String(error))
</script>

{#if graph.showsDrillBar}
	<nav data-graph-drill aria-label="Drill path">
		<ol data-graph-drill-trail>
			{#each graph.breadcrumbs as crumb, i (crumb.path.join('/'))}
				<li>
					{#if i < graph.breadcrumbs.length - 1}
						<button
							type="button"
							data-graph-drill-crumb
							onclick={() => graph.drillTo(crumb.path)}>{crumb.label ?? rootLabel}</button
						>
					{:else}
						<span data-graph-drill-crumb aria-current="location">{crumb.label ?? rootLabel}</span>
					{/if}
				</li>
			{/each}
		</ol>
		{#if graph.drillTarget}
			<button
				type="button"
				data-graph-drill-open
				onclick={() => graph.drillTarget && graph.drillInto(graph.drillTarget)}
				>Open {graph.drillTarget.name}</button
			>
		{/if}
		{#if graph.pending}
			<span data-graph-drill-status role="status">Loading…</span>
		{/if}
		{#if graph.drillError !== null}
			<span data-graph-drill-error role="alert">Could not open: {message(graph.drillError)}</span>
		{/if}
	</nav>
{/if}
