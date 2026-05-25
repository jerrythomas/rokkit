<script lang="ts">
	import type { Snippet } from 'svelte'
	import { who as whoStore } from '../who.svelte'

	interface ChatMessageProps {
		/** Visual variant — drives node decoration and body typography */
		kind?: 'user' | 'info' | 'think' | 'system'
		/** Uppercase eyebrow label, e.g. "MOUNTED", "YOU", "THINKING" */
		head?: string
		/**
		 * Author name, rendered next to the head label. Defaults from `kind`:
		 *  - user → "you"
		 *  - info → "assistant"
		 *  - think / system → no default
		 * A consumer wiring this up to a real product would pass the user's
		 * display name on user messages and the assistant brand (e.g. "Rokkit")
		 * on info messages. Pass an empty string to suppress the slot.
		 */
		who?: string
		/** Relative timestamp, e.g. "just now", "2m" */
		ago?: string
		/**
		 * Icon for the leading node. Accepts either:
		 *  - a Snippet for full custom rendering, or
		 *  - a string CSS class (e.g. an Iconify class like `i-mdi:layers`).
		 * Falls back to a dot (or thinking-dots for `kind="think"`) when absent.
		 */
		icon?: Snippet | string
		/** Message body content */
		children?: Snippet
	}

	const {
		kind = 'info',
		head,
		who: whoProp,
		ago,
		icon,
		children
	}: ChatMessageProps = $props()

	// Default author name per kind, sourced from the chat-wide `who` store
	// so a page can configure once (`who.user = 'Jerry'; who.assistant = 'Rokkit'`)
	// and every message picks it up. Per-message override still wins via
	// the `who` prop; pass an explicit empty string to suppress the slot.
	const who = $derived.by(() => {
		if (whoProp !== undefined) return whoProp
		if (kind === 'user') return whoStore.user
		if (kind === 'info') return whoStore.assistant
		return undefined
	})

	const iconIsSnippet = $derived(typeof icon === 'function')
	const iconClass = $derived(typeof icon === 'string' ? icon : '')
</script>

<div data-chat-message data-kind={kind}>
	<span data-chat-message-node>
		{#if iconIsSnippet}
			{@render (icon as Snippet)()}
		{:else if iconClass}
			<span data-chat-message-icon class={iconClass} aria-hidden="true"></span>
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
