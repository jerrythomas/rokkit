<script lang="ts">
	import MarkdownRenderer from '../MarkdownRenderer.svelte'
	import { formatRelativeTime } from '../utils/relative-time.js'
	import type { ChatMessageProps } from '../types/chat.js'

	const { message, relativeTime = true, body, avatar, label }: ChatMessageProps = $props()
</script>

<div data-chat-message data-role={message.role} data-status={message.status || undefined}>
	{#if avatar}{@render avatar(message)}{/if}
	<div data-chat-bubble>
		{#if label}{@render label(message)}{/if}
		<div data-chat-body>
			{#if body}
				{@render body(message)}
			{:else if message.text}
				<MarkdownRenderer markdown={message.text} />
			{/if}
			{#if message.status === 'streaming'}<span data-chat-caret aria-hidden="true"></span>{/if}
		</div>
		{#if message.timestamp}
			<time data-chat-time datetime={message.timestamp}
				>{formatRelativeTime(message.timestamp, relativeTime)}</time
			>
		{/if}
	</div>
</div>
