<script lang="ts">
	import { ChatStream, ChatMessage } from '$lib/chat'
	import { shell } from '$lib/koan/shell.svelte'
	import { explorer } from './store.svelte'
	import { datasets } from './datasets'

	const active = $derived(datasets[explorer.dataset])
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
		<strong>Data-first, not schema-first.</strong> Both datasets render through the same
		component. The e-commerce one is database JSON; the service call graph shares none of its
		key names and is adapted entirely by a <code>fields</code> map. Switch the dataset to see it.
	</ChatMessage>
	<ChatMessage kind="info" status="explained" icon="i-mdi:palette-swatch">
		<strong>Layouts are pluggable.</strong>
		<code>cluster</code> groups and untangles; <code>neighborhood</code> centres the selected
		node and shows one hop. Both are plain
		<code>(model, options) =&gt; LayoutResult</code> functions, so your own slots in the same way.
	</ChatMessage>
</ChatStream>
