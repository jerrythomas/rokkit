<script lang="ts">
	import { getContext, untrack } from 'svelte'
	import { Table } from '@rokkit/ui'
	import type { TableColumn } from '@rokkit/ui'
	import { GraphState } from '../GraphState.svelte.js'
	import type { EntityRow, GraphStateConfig } from '../GraphState.svelte.js'
	import NoteBlocks from './NoteBlocks.svelte'
	import type { GraphFields } from '../types.js'
	import { say } from '../messages.js'

	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		caption = undefined,
		class: className = ''
	}: {
		state?: GraphState
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		caption?: string
		class?: string
	} = $props()

	const config = (): GraphStateConfig => ({ nodes, edges, fields })

	// untrack: the constructor's initial read must not become a dependency of the creating
	// scope. Only built when this view is standalone — see the resolution order below.
	const own = untrack(() => new GraphState(config()))
	const fromContext = getContext<GraphState | undefined>('graph-state')

	// Resolved ONCE, in the same three-way order Graph.svelte uses, so a view works inside a
	// <Graph>, beside one, or alone: the prop wins, then context, then the state we build.
	// svelte-ignore state_referenced_locally
	const graph = provided ?? fromContext ?? own

	// Only sync the state WE own. A prop- or context-supplied state is its owner's to drive.
	$effect(() => {
		if (graph === own) own.update(config())
	})

	// $derived, so the headings follow a locale change.
	const columns: TableColumn[] = $derived([
		{ name: 'label', label: say('entity'), snippet: 'entity' },
		{ name: 'rowCount', label: say('rows'), align: 'right', snippet: 'rows' },
		{ name: 'refCount', label: say('refs'), align: 'right', snippet: 'refs' },
		{ name: 'note', label: say('comment'), sortable: false, snippet: 'comment' }
	])
</script>

{#snippet entity(_value: unknown, _column: TableColumn, row: Record<string, unknown>)}
	{@const item = row as unknown as EntityRow}
	<span data-graph-entity data-graph-entity-kind={item.kind}>
		{#if item.group}<span data-graph-entity-group>{item.group}.</span>{/if}<span
			data-graph-entity-label>{item.label}</span
		>
	</span>
{/snippet}

{#snippet rows(_value: unknown, _column: TableColumn, row: Record<string, unknown>)}
	<span data-graph-entity-rows>{(row as unknown as EntityRow).rowCount}</span>
{/snippet}

{#snippet refs(_value: unknown, _column: TableColumn, row: Record<string, unknown>)}
	{@const count = (row as unknown as EntityRow).refCount}
	<!-- The em dash is a PRESENTATION choice and belongs here: state reports the number 0,
	     and a column of zeros reads as noise next to the counts that matter. -->
	<span data-graph-entity-refs>{count > 0 ? count : '—'}</span>
{/snippet}

{#snippet comment(_value: unknown, _column: TableColumn, row: Record<string, unknown>)}
	<NoteBlocks note={(row as unknown as EntityRow).note} />
{/snippet}

<Table
	data={graph.entities}
	{columns}
	{caption}
	class={className}
	selectable="single"
	onselect={(_value, row) => graph.select((row as unknown as EntityRow).id)}
	snippets={{ entity, rows, refs, comment }}
/>
