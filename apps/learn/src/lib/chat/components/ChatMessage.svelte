<script lang="ts">
	import type { Snippet } from 'svelte'
	import { who as whoStore } from '../who.svelte'
	import IconTimeline from './IconTimeline.svelte'

	interface ChatMessageProps {
		/** Visual variant — drives node decoration and body typography */
		kind?: 'user' | 'info' | 'think' | 'system'
		/**
		 * Semantic status marker (kebab-case, e.g. "mounted", "explained",
		 * "thinking", "try-variants"). Surfaces as `data-message-status` on
		 * the message root so themes can skin badges per-status without the
		 * label string being hardcoded in callers. When `head` is unset, the
		 * label slot derives from this value (hyphens → spaces; CSS handles
		 * casing via text-transform).
		 */
		status?: string
		/**
		 * Per-message eyebrow label override. Wins over status-derived and
		 * who-derived labels. Use sparingly — prefer `status` so themes can
		 * own the badge text.
		 */
		head?: string
		/**
		 * Author name fallback when neither `head` nor `status` is set.
		 * Defaults from `kind` via the chat-wide `who` store:
		 *  - user → store.user (canonical "you")
		 *  - info → store.assistant (canonical "assistant", configure to "Rokkit" etc.)
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
		status,
		head,
		who: whoProp,
		ago,
		icon,
		children
	}: ChatMessageProps = $props()

	// Single label per turn, resolved in priority order:
	//   1. `head` — explicit per-message override
	//   2. `status` — semantic marker, hyphens replaced with spaces (CSS
	//      `text-transform: uppercase` does the visual casing)
	//   3. `who` — kind-default author name from the chat-wide `who` store,
	//      overridable per-message via the `who` prop. Pass `who=""` to drop
	//      the label slot entirely.
	const who = $derived.by(() => {
		if (whoProp !== undefined) return whoProp
		if (kind === 'user') return whoStore.user
		if (kind === 'info') return whoStore.assistant
		return undefined
	})
	const label = $derived.by(() => {
		if (head !== undefined) return head
		if (status) return status.replace(/-/g, ' ')
		return who
	})

	// `think` kind without an explicit icon shows the three animated dots
	// instead of IconTimeline's default fill-dot. Other kinds with no icon
	// inherit the default dot from IconTimeline.
	const showThinkingDots = $derived(kind === 'think' && !icon)
</script>

<IconTimeline
	icon={showThinkingDots ? thinkingDots : icon}
	data-koanchat-message=""
	data-kind={kind}
	data-message-status={status}
>
	{#if label || ago}
		<div data-koanchat-message-head>
			{#if label}<span data-head>{label}</span>{/if}
			{#if ago}<span data-ago>{ago}</span>{/if}
		</div>
	{/if}
	{#if children}
		<div data-koanchat-message-body>
			{@render children()}
		</div>
	{/if}
</IconTimeline>

{#snippet thinkingDots()}
	<span data-thinking-dots><span></span><span></span><span></span></span>
{/snippet}
