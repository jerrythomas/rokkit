<script lang="ts">
	import type { Snippet } from 'svelte'

	interface ChatMessageProps {
		/** Visual variant — drives node decoration and body typography */
		kind?: 'user' | 'info' | 'think' | 'system'
		/** Uppercase eyebrow label, e.g. "MOUNTED", "YOU", "THINKING" */
		head?: string
		/** Author name, rendered next to the head label */
		who?: string
		/** Relative timestamp, e.g. "just now", "2m" */
		ago?: string
		/** Optional icon for the leading node — falls back to a dot */
		icon?: Snippet
		/** Message body content */
		children?: Snippet
	}

	const {
		kind = 'info',
		head,
		who,
		ago,
		icon,
		children
	}: ChatMessageProps = $props()
</script>

<div data-chat-message data-kind={kind}>
	<span data-chat-message-node>
		{#if icon}
			{@render icon()}
		{:else if kind === 'think'}
			<span data-thinking-dots><span></span><span></span><span></span></span>
		{:else}
			<span data-chat-message-dot></span>
		{/if}
	</span>
	{#if head || who || ago}
		<div data-chat-message-head>
			{#if head}<span data-head>{head}</span>{/if}
			{#if who}<span data-who>{who}</span>{/if}
			{#if ago}<span data-ago>{ago}</span>{/if}
		</div>
	{/if}
	{#if children}
		<div data-chat-message-body>
			{@render children()}
		</div>
	{/if}
</div>
