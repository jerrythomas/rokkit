<script lang="ts">
	import type { Snippet } from 'svelte'
	import { who as whoStore } from '../who.svelte'

	interface ChatMessageProps {
		/** Visual variant — drives node decoration and body typography */
		kind?: 'user' | 'info' | 'think' | 'system'
		/**
		 * Per-message eyebrow label override (e.g. "MOUNTED", "EXPLAINED",
		 * "THINKING"). When set, takes the label slot. When unset, the slot
		 * falls back to `who` — see below.
		 */
		head?: string
		/**
		 * Author name, used as the label when `head` is unset. Defaults from
		 * `kind` via the chat-wide `who` store:
		 *  - user → store.user (default "YOU", commonly stays as-is)
		 *  - info → store.assistant (default "ASSISTANT", configure to "Rokkit" etc.)
		 *  - think / system → no default
		 * Pass an explicit empty string to suppress the label slot entirely.
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

	// Single label per turn: `head` (e.g. status badge) wins; otherwise the
	// kind-default author name from the `who` store, optionally overridden
	// per-message via the `who` prop. Pass `who=""` to drop the label slot.
	const who = $derived.by(() => {
		if (whoProp !== undefined) return whoProp
		if (kind === 'user') return whoStore.user
		if (kind === 'info') return whoStore.assistant
		return undefined
	})
	const label = $derived(head ?? who)

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
	{#if label || ago}
		<div data-chat-message-head>
			{#if label}<span data-head>{label}</span>{/if}
			{#if ago}<span data-ago>{ago}</span>{/if}
		</div>
	{/if}
	{#if children}
		<div data-chat-message-body>
			{@render children()}
		</div>
	{/if}
</div>
