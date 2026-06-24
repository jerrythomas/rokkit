<script lang="ts">
	type Item = { id: string; icon: string; title: string; timestamp: string }

	let {
		items = [] as Item[],
		activeId = null as string | null,
		relativeTime = true,
		onselect
	}: {
		items?: Item[]
		activeId?: string | null
		relativeTime?: boolean
		onselect?: (item: Item) => void
	} = $props()

	function formatTime(iso: string): string {
		if (!relativeTime) return new Date(iso).toLocaleTimeString()
		const diff = (Date.now() - new Date(iso).getTime()) / 1000
		if (diff < 60) return 'just now'
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
		return `${Math.floor(diff / 86400)}d ago`
	}
</script>

<ul class="timeline" role="list">
	{#each items as item (item.id)}
		<li>
			<button
				type="button"
				class="entry"
				class:active={item.id === activeId}
				onclick={() => onselect?.(item)}
			>
				<span class="icon">{item.icon}</span>
				<span class="title">{item.title}</span>
				<span class="time">{formatTime(item.timestamp)}</span>
			</button>
		</li>
	{/each}
</ul>

<style>
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.entry {
		display: grid;
		grid-template-columns: 24px 1fr auto;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 10px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm, 4px);
		text-align: left;
		@apply text-ink-mute;
		cursor: pointer;
		font-size: 13px;
		transition: background 120ms ease;
	}
	.entry:hover {
		@apply bg-paper-mute text-ink-mute;
	}
	.entry.active {
		@apply bg-paper-mute text-ink-mute;
	}
	.icon {
		font-size: 16px;
		text-align: center;
		@apply text-ink-soft;
	}
	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.time {
		font-size: 11px;
		@apply text-ink-soft;
	}
</style>
