<script lang="ts">
	import { ChatStream, ChatMessage, Chips } from '$lib/chat'
	import { shell } from '$lib/koan/shell.svelte'
	import { sparkline, type SparklineTip } from './store.svelte'

	const tipChips = $derived(sparkline.tips.map((t) => ({ label: t.text, tip: t })))

	function runTip(item: { tip?: SparklineTip }) {
		if (item.tip) sparkline.apply(item.tip.set)
	}
</script>

<ChatStream>
	<ChatMessage kind="user" ago="2m" icon="i-mdi:chat-outline">
		{shell.lastQuery}
	</ChatMessage>
	<ChatMessage kind="info" status="mounted" ago="just now" icon="i-mdi:chart-line-variant">
		<code>&lt;Sparkline/&gt;</code> from <code>@rokkit/chart</code> on the canvas.
		{sparkline.describe()}
	</ChatMessage>
	<ChatMessage kind="info" status="explained" icon="i-mdi:tune-variant">
		<strong>One tiny inline chart.</strong> Toggle <code>type</code>, a zero
		<code>baseline</code>, <code>highlight</code> markers and a <code>trend</code>
		line under <em>tweak</em> — the same enriched props you'd pass in a table cell.
	</ChatMessage>
	{#if tipChips.length > 0}
		<ChatMessage kind="info" status="try" icon="i-mdi:auto-fix">
			Try one — it re-renders the sparkline on the canvas.
		</ChatMessage>
		<Chips items={tipChips} onselect={runTip} />
	{/if}
</ChatStream>
