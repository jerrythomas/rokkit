<script lang="ts">
	import { formatRelativeTime } from '../utils/relative-time.js'
	import type { ChatHistoryProps } from '../types/chat.js'

	const {
		conversations = [],
		activeId = null,
		relativeTime = true,
		onselect,
		onnew,
		ondelete,
		item,
		empty,
		header
	}: ChatHistoryProps = $props()
</script>

<div data-chat-history>
	{#if header}{@render header()}{/if}
	{#if onnew}<button type="button" data-chat-history-new onclick={() => onnew()}>New conversation</button>{/if}
	{#if conversations.length === 0}
		{#if empty}{@render empty()}{/if}
	{:else}
		{#each conversations as conversation (conversation.id)}
			{#if item}
				{@render item(conversation)}
			{:else}
				<div data-chat-history-row data-active={conversation.id === activeId || undefined}>
					<button type="button" data-chat-history-item onclick={() => onselect?.(conversation.id)}>
						<span data-chat-history-title>{conversation.title}</span>
						{#if conversation.timestamp}
							<time data-chat-history-time>{formatRelativeTime(conversation.timestamp, relativeTime)}</time>
						{/if}
					</button>
					{#if ondelete}
						<button type="button" data-chat-history-delete aria-label="Delete conversation" onclick={() => ondelete(conversation.id)}>×</button>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>
