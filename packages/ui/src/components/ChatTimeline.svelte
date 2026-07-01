<script lang="ts">
	import ChatMessage from './ChatMessage.svelte'
	import type { ChatTimelineProps } from '../types/chat.js'

	let { messages = [], relativeTime = true, autoscroll = true, message, empty }: ChatTimelineProps = $props()

	let container: HTMLElement | undefined = $state()

	// Auto-scroll to the newest content when messages grow or the last message streams.
	$effect(() => {
		const last = messages[messages.length - 1]
		// touch reactive deps so the effect re-runs on append + streaming updates
		void messages.length
		void last?.text
		void last?.status
		if (autoscroll && container) container.scrollTop = container.scrollHeight
	})
</script>

<div bind:this={container} data-chat-timeline>
	{#if messages.length === 0}
		{#if empty}{@render empty()}{/if}
	{:else}
		{#each messages as msg (msg.id)}
			{#if message}
				{@render message(msg)}
			{:else}
				<ChatMessage message={msg} {relativeTime} />
			{/if}
		{/each}
	{/if}
</div>
