<script lang="ts">
	/**
	 * One control per row of the design's verification table, so every claim the package makes
	 * is checkable by eye and by Playwright.
	 *
	 * Native <select> rather than @rokkit/ui's Select, matching the sibling chart demo: these
	 * are demo chrome, they are label-associated and keyboard-native for free, and Playwright
	 * drives them with getByLabel().selectOption(). Select has its own demo page; this one's
	 * job is verifying @rokkit/graph.
	 */
	import { appliesTo } from '@rokkit/graph'
	import { explorer } from './store.svelte'
	import { datasets } from './datasets'

	/**
	 * `option` names the layout option a row drives, so the package decides whether the row is
	 * offered. A control the active layout ignores looks like a knob, moves, and changes
	 * nothing — which reads as a broken view rather than as an inapplicable control. Density is
	 * the plainest case: a treemap box has no row list to thin out.
	 *
	 * Rows with no `option` are not layout options at all (dataset, view, the colour channel)
	 * and always apply.
	 */
	type Row = {
		id: string
		label: string
		option?: string
		options: { value: string; label: string }[]
		get: () => string
		set: (value: string) => void
	}

	const rows: Row[] = [
		{
			id: 'dataset',
			label: 'Dataset',
			options: Object.values(datasets).map((d) => ({ value: d.id, label: d.label })),
			get: () => explorer.dataset,
			set: (v: string) => explorer.selectDataset(v as typeof explorer.dataset)
		},
		{
			id: 'view',
			label: 'View',
			options: [
				{ value: 'diagram', label: 'Diagram' },
				{ value: 'entity', label: 'Entity' },
				{ value: 'entities', label: 'Entities' }
			],
			get: () => explorer.view,
			set: (v: string) => (explorer.view = v as typeof explorer.view)
		},
		{
			id: 'layout',
			label: 'Layout',
			options: [
				{ value: 'cluster', label: 'Cluster (cards)' },
				{ value: 'flow', label: 'Flow (layered)' },
				{ value: 'points', label: 'Points (dense)' },
				{ value: 'neighborhood', label: 'Neighborhood' },
				{ value: 'world', label: 'World (treemap)' }
			],
			get: () => explorer.layout,
			set: (v: string) => (explorer.layout = v as typeof explorer.layout)
		},
		{
			id: 'density',
			label: 'Density',
			option: 'density',
			options: [
				{ value: 'names', label: 'Names' },
				{ value: 'keys', label: 'Keys' },
				{ value: 'full', label: 'Full' }
			],
			get: () => explorer.density,
			set: (v: string) => (explorer.density = v as typeof explorer.density)
		},
		{
			id: 'size-by',
			label: 'Size by',
			option: 'sizeBy',
			options: [
				{ value: 'degree', label: 'Degree' },
				{ value: 'declarations', label: 'Declarations' },
				{ value: 'lines', label: 'Lines' },
				{ value: 'files', label: 'Files' },
				{ value: 'tested', label: 'Tested modules' }
			],
			get: () => explorer.sizeBy,
			set: (v: string) => (explorer.sizeBy = v)
		},
		{
			id: 'grouping',
			label: 'Group by',
			option: 'groupBy',
			options: [
				{ value: 'schema', label: 'Schema' },
				{ value: 'kind', label: 'Kind' },
				{ value: 'schema-kind', label: 'Schema › Kind' },
				{ value: 'kind-schema', label: 'Kind › Schema' }
			],
			get: () => explorer.grouping,
			set: (v: string) => (explorer.grouping = v as typeof explorer.grouping)
		},
		{
			id: 'arrange',
			label: 'Arrange',
			option: 'arrange',
			options: [
				{ value: 'untangle', label: 'Untangle' },
				{ value: 'a-z', label: 'A–Z' }
			],
			get: () => explorer.arrange,
			set: (v: string) => (explorer.arrange = v as typeof explorer.arrange)
		},
		{
			id: 'edge-style',
			label: 'Edge style',
			option: 'edgeStyle',
			options: [
				{ value: 'curved', label: 'Curved' },
				{ value: 'orthogonal', label: 'Orthogonal' }
			],
			get: () => explorer.edgeStyle,
			set: (v: string) => (explorer.edgeStyle = v as typeof explorer.edgeStyle)
		},
		{
			id: 'using',
			label: 'Differentiate by',
			options: [
				{ value: 'color', label: 'Colour' },
				{ value: 'pattern', label: 'Pattern' }
			],
			get: () => explorer.using,
			set: (v: string) => (explorer.using = v as typeof explorer.using)
		}
	]
</script>

<div data-graph-controls class="controls">
	{#each rows.filter((r) => !r.option || appliesTo(explorer.layout, r.option)) as row (row.id)}
		<!-- Explicit for/id, NOT a wrapping <label>. An implicit label computes the control's
		     accessible name from all of its text content, so a wrapped <select> is announced as
		     "View Diagram Entity Entities" — the whole option list read as the field's name. -->
		<div class="row">
			<label for="graph-control-{row.id}">{row.label}</label>
			<select
				id="graph-control-{row.id}"
				value={row.get()}
				onchange={(e) => row.set(e.currentTarget.value)}
			>
				{#each row.options as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	{/each}
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
