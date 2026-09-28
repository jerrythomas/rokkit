<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { ChatStream, ChatMessage, Chips } from '$lib/chat'
	import { shell } from '$lib/koan/shell.svelte'
	import { explorer } from './store.svelte'
	import { datasets } from './datasets'
	import meta from './meta'

	const active = $derived(datasets[explorer.dataset])

	/*
	 * Variant chips have to be rendered HERE. The layout renders them only in its generic
	 * demo branch; a demo with its own conversation component — chart, sparkline, this one —
	 * owns its whole chat stream, so declaring `variants` in meta and stopping there leaves
	 * them surfaced nowhere. They were invisible until this existed.
	 */
	const current = $derived(page.url.searchParams.get('variant'))

	const chips = $derived(
		(meta.variants ?? []).map((v) => ({
			label: v.label,
			icon: 'i-mdi:auto-fix',
			id: v.id,
			active: current === v.id
		}))
	)

	function pick(item: { id?: string; active?: boolean }) {
		if (!item.id) return
		goto(item.active ? '/app/graph' : `/app/graph?variant=${item.id}`)
	}
</script>

<ChatStream>
	<ChatMessage kind="user" ago="2m" icon="i-mdi:chat-outline">
		{shell.lastQuery}
	</ChatMessage>
	<ChatMessage kind="info" status="mounted" ago="just now" icon="i-mdi:graph-outline">
		<code>&lt;Graph/&gt;</code> from <code>@rokkit/graph</code> on the canvas, showing
		<strong>{active.label}</strong>.
	</ChatMessage>
	<ChatMessage kind="info" status="explained" icon="i-mdi:map-marker-path">
		<strong>An ER diagram is table entities and their foreign keys.</strong> A view is a derived
		projection and a routine is behaviour — neither is an entity, so neither is here. They live
		in <strong>Schema dependencies</strong>, where the edges that give them meaning
		(<code>reads</code>, <code>writes</code>, <code>calls</code>, <code>member</code>) actually
		exist. Both views come from one <code>SchemaModel</code>, split by
		<code>toGraphInput</code>.
	</ChatMessage>
	<ChatMessage kind="info" status="explained" icon="i-mdi:shape-outline">
		<strong>Data-first, not schema-first.</strong> An ER diagram is one thing this draws, not
		what it is. The call graph shares none of the schema shape's key names —
		<code>key</code>, <code>team</code>, <code>endpoints</code>, <code>caller</code>,
		<code>callee</code> — and is adapted entirely by a <code>fields</code> map.
	</ChatMessage>
	<ChatMessage kind="info" status="explained" icon="i-mdi:palette-swatch">
		<strong>Layouts are pluggable.</strong>
		<code>cluster</code> groups and untangles; <code>neighborhood</code> centres the selected
		node and shows one hop. Both are plain
		<code>(model, options) =&gt; LayoutResult</code> functions, so your own slots in the same way.
	</ChatMessage>
	{#if chips.length > 0}
		<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
			Pick an example — same component, a completely different shape of data. The URL
			updates, so each one is bookmarkable.
		</ChatMessage>
		<Chips items={chips} onselect={pick} />
	{/if}
</ChatStream>
