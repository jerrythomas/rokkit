<script lang="ts">
	/**
	 * Where the reader has drilled to, and the way back (#165).
	 *
	 * Breadcrumbs from the root to the current level (each an ancestor to climb to), a status
	 * while the host loads a level, the error when a load fails, "Open" for the selected box
	 * when it can be drilled — the keyboard route into a leaf, since Enter on a leaf selects it —
	 * and Expand / Collapse for the selected group or group member (#166).
	 * Renders nothing when there is nothing to show. Each control declares its intent; the
	 * `interactions` action performs it, so this reads the state and computes nothing.
	 */
	import { interactions } from '../actions/interactions.js'
	import { say } from '../messages.js'
	import type { GraphState } from '../GraphState.svelte.js'

	type Props = {
		state: GraphState
		/** What the root crumb says. Defaults to the locale's (`All`). */
		rootLabel?: string
	}

	let { state: graph, rootLabel = undefined }: Props = $props()
</script>

{#if graph.showsDrillBar}
	<nav data-graph-drill aria-label={say('drillPath')} use:interactions={{ state: graph }}>
		<ol data-graph-drill-trail>
			{#each graph.breadcrumbs as crumb, i (crumb.path.join('/'))}
				<li>
					{#if crumb.current}
						<span data-graph-drill-crumb aria-current="location"
							>{crumb.label ?? rootLabel ?? say('drillRoot')}</span
						>
					{:else}
						<button type="button" data-graph-drill-crumb data-graph-press="crumb" data-graph-key={String(i)}
							>{crumb.label ?? rootLabel ?? say('drillRoot')}</button
						>
					{/if}
				</li>
			{/each}
		</ol>
		{#if graph.groupAction}
			<!-- The keyboard route through a group: Enter selects a node, then this opens or folds it. -->
			<button
				type="button"
				data-graph-group-action={graph.groupAction.kind}
				data-graph-press="group-selected"
				>{say(graph.groupAction.kind, { name: graph.groupAction.label })}</button
			>
		{/if}
		{#if graph.drillTarget}
			<button type="button" data-graph-drill-open data-graph-press="open-selected"
				>{say('open', { name: graph.drillTarget.name })}</button
			>
		{/if}
		{#if graph.pending}
			<span data-graph-drill-status role="status">{say('drillLoading')}</span>
		{/if}
		{#if graph.drillErrorText}
			<span data-graph-drill-error role="alert">{graph.drillErrorText}</span>
		{/if}
	</nav>
{/if}
