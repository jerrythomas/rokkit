<script lang="ts">
	import { getContext, untrack } from 'svelte'
	import { GraphState } from '../GraphState.svelte.js'
	import type { GraphStateConfig } from '../GraphState.svelte.js'
	import NoteBlocks from './NoteBlocks.svelte'
	import { baseType, typeSize } from './column-type.js'
	import type { GraphFields } from '../types.js'
	import { counted, say } from '../messages.js'
	import { interactions } from '../actions/interactions.js'

	let {
		state: provided,
		nodes = [],
		edges = [],
		fields = {},
		value = undefined,
		class: className = ''
	}: {
		state?: GraphState
		nodes?: unknown[]
		edges?: unknown[]
		fields?: GraphFields
		value?: string | null
		class?: string
	} = $props()

	const config = (): GraphStateConfig => ({ nodes, edges, fields, value })

	const own = untrack(() => new GraphState(config()))
	const fromContext = getContext<GraphState | undefined>('graph-state')

	// Same three-way resolution as Graph and EntitiesView: prop, then context, then the state
	// we build. Resolved once — context captures a value, not a getter.
	// svelte-ignore state_referenced_locally
	const graph = provided ?? fromContext ?? own

	$effect(() => {
		if (graph === own) own.update(config())
	})

	// A read, not a derivation: GraphState owns the in/out split and the meta passthrough.
	const entity = $derived(graph.entity)
	const indexes = $derived(
		(entity?.meta.indexes ?? []) as { def: string; unique?: boolean; name?: string }[]
	)
</script>

{#if entity}
	<article data-graph-entity data-node-kind={entity.kind} class={className} use:interactions={{ state: graph }}>
		<header data-graph-entity-head>
			{#if entity.group}<span data-graph-entity-group>{entity.group}.</span>{/if}
			<h2 data-graph-entity-title>{entity.label}</h2>
			<span data-graph-entity-count>{counted(entity.rows.length, 'columnOne', 'columnMany')}</span>
		</header>

		{#if entity.note}
			<section data-graph-section="note">
				<h3 data-graph-section-title>{say('comment')}</h3>
				<NoteBlocks note={entity.note} />
			</section>
		{/if}

		<section data-graph-section="columns">
			<h3 data-graph-section-title>{say('columns')}</h3>
			{#each entity.rows as row (row.name)}
				<div data-graph-column>
					<span data-graph-column-name>{row.name}</span>
					{#if row.note}<span data-graph-column-note>{row.note}</span>{/if}
					<span data-graph-column-badges>
						{#each row.badges as badge (badge)}
							<span data-row-badge={badge}>{badge}</span>
						{/each}
					</span>
					<span data-graph-column-type>{baseType(row.type ?? '')}</span>
					<span data-graph-column-size>{typeSize(row.type ?? '')}</span>
				</div>
			{/each}
		</section>

		{#if indexes.length > 0}
			<section data-graph-section="indexes">
				<h3 data-graph-section-title>{say('indexes')}</h3>
				{#each indexes as index, i (i)}
					<div data-graph-index>
						<span data-graph-index-def>{index.def}</span>
						{#if index.unique}<span data-graph-index-unique>{say('unique')}</span>{/if}
						{#if index.name}<span data-graph-index-name>{index.name}</span>{/if}
					</div>
				{/each}
			</section>
		{/if}

		<section data-graph-section="relationships">
			<h3 data-graph-section-title>{say('relationships')}</h3>
			{#if graph.relationships.length === 0}
				<p data-graph-relationships-empty>{say('noRelationships')}</p>
			{:else}
				{#each graph.relationships as rel, i (rel.edge.id + i)}
					<button
						type="button"
						data-graph-relationship={rel.direction}
						data-graph-press="select"
						data-graph-key={rel.id}
					>
						{#if rel.group}<span data-graph-relationship-group>{rel.group}.</span>{/if}
						<span data-graph-relationship-label>{rel.label}</span>
						{#if rel.edge.action}
							<span data-graph-relationship-action>{rel.edge.action}</span>
						{/if}
					</button>
				{/each}
			{/if}
		</section>
	</article>
{:else}
	<article data-graph-entity data-graph-entity-empty class={className}>
		<p>{say('noEntity')}</p>
	</article>
{/if}
