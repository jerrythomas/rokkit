<script lang="ts">
	/**
	 * Only what the DEMO adds around a diagram.
	 *
	 * Density, depth, edge style and zoom are gone from here: each diagram publishes the ones
	 * that mean something for it and draws them on its own canvas. A second copy in a drawer
	 * would be the same value in two places, and the old panel's real problem — a knob that
	 * moves while the picture does not — came from exactly that separation.
	 *
	 * Native <select> rather than @rokkit/ui's Select, matching the sibling chart demo: these
	 * are demo chrome, they are label-associated and keyboard-native for free, and Playwright
	 * drives them with getByLabel().selectOption().
	 */
	import { explorer } from './store.svelte'
	import { diagramGroups, diagrams, type DiagramId } from './registry'
</script>

<div data-graph-controls class="controls">
	<div class="row">
		<label for="graph-control-diagram">Diagram</label>
		<select
			id="graph-control-diagram"
			value={explorer.diagram}
			onchange={(e) => explorer.select(e.currentTarget.value as DiagramId)}
		>
			<!-- Grouped by the question each answers, so the list reads as a menu rather than
			     as seven component names. -->
			{#each diagramGroups as group (group)}
				<optgroup label={group}>
					{#each diagrams.filter((d) => d.group === group) as diagram (diagram.id)}
						<option value={diagram.id}>{diagram.label}</option>
					{/each}
				</optgroup>
			{/each}
		</select>
	</div>

	<!-- The entity table and the single-entity card only make sense where nodes HAVE rows.
	     A codebase module has none, so the option is absent rather than empty. -->
	{#if explorer.hasViews}
		<div class="row">
			<label for="graph-control-view">View</label>
			<select
				id="graph-control-view"
				value={explorer.view}
				onchange={(e) => (explorer.view = e.currentTarget.value as typeof explorer.view)}
			>
				<option value="diagram">Diagram</option>
				<option value="entity">Entity</option>
				<option value="entities">Entities</option>
			</select>
		</div>
	{/if}

	<div class="row">
		<label for="graph-control-using">Differentiate by</label>
		<select
			id="graph-control-using"
			value={explorer.using}
			onchange={(e) => (explorer.using = e.currentTarget.value as typeof explorer.using)}
		>
			<option value="color">Colour</option>
			<option value="pattern">Pattern</option>
		</select>
	</div>

	<!-- Both are props on every diagram, so the demo shows them being turned off — that is
	     the point of them being opt-in rather than built into the canvas. -->
	<div class="row">
		<label for="graph-control-controls">On-canvas controls</label>
		<select
			id="graph-control-controls"
			value={explorer.controls ? 'on' : 'off'}
			onchange={(e) => (explorer.controls = e.currentTarget.value === 'on')}
		>
			<option value="on">On</option>
			<option value="off">Off</option>
		</select>
	</div>

	<div class="row">
		<label for="graph-control-legend">Legend</label>
		<select
			id="graph-control-legend"
			value={explorer.legend ? 'on' : 'off'}
			onchange={(e) => (explorer.legend = e.currentTarget.value === 'on')}
		>
			<option value="on">On</option>
			<option value="off">Off</option>
		</select>
	</div>
</div>

<style>
	.controls {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.8125rem;
	}

	select {
		min-width: 9rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--paper-edge);
		border-radius: 0.25rem;
		background: var(--paper);
		color: var(--ink);
		font: inherit;
		font-size: 0.8125rem;
	}
</style>
