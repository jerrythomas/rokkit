<script lang="ts">
	import { ChatStream, ChatMessage, Chips } from '$lib/chat'
	import { shell } from '$lib/koan/shell.svelte'
	import { explorer } from './store.svelte'
	import type { Tip } from './registry'

	// Suggested next steps for the active type, as data-driven chips (same
	// component the tabs demo uses for its variant chips). Clicking one applies
	// the change; the messages below re-render reactively to describe it.
	const tipChips = $derived(explorer.tips.map((t) => ({ label: t.text, tip: t })))

	function runTip(item: { tip?: Tip }) {
		if (item.tip) explorer.apply(item.tip)
	}
</script>

<ChatStream>
	<ChatMessage kind="user" ago="2m" icon="i-mdi:chat-outline">
		{shell.lastQuery}
	</ChatMessage>
	<ChatMessage kind="info" status="mounted" ago="just now" icon="i-mdi:chart-box-outline">
		<code>&lt;Charts/&gt;</code> from <code>@rokkit/chart</code> on the canvas.
		{explorer.describe()}
	</ChatMessage>
	<ChatMessage kind="info" status="explained" icon="i-mdi:palette">
		<strong>One aesthetic surface.</strong> Every geom takes the same channels —
		<code>fill</code>/<code>color</code>, <code>pattern</code>,
		<code>position</code> (stack · dodge · fill) and <code>alpha</code>. Open
		<em>tweak</em> under the composer to change them for this type.
	</ChatMessage>
	{#if tipChips.length > 0}
		<ChatMessage kind="info" status="try" icon="i-mdi:auto-fix">
			Try one — it re-renders the chart on the canvas.
		</ChatMessage>
		<Chips items={tipChips} onselect={runTip} />
	{/if}
</ChatStream>
