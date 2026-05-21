<script lang="ts">
	import type { Snippet } from 'svelte'

	interface ChatResponseProps {
		/** Component / artifact name shown in the header, e.g. "<Tabs/>" */
		name: string
		/** Secondary metadata next to the name, e.g. "· @rokkit/ui · style=zen-sumi" */
		meta?: string
		/** Right-aligned badge in header, e.g. "LIVE" or "WIZARD" */
		kicker?: string
		/** Optional override for kicker accent color (CSS color) */
		kickerColor?: string
		/** Leading icon snippet for the header */
		icon?: Snippet
		/** Main body content (the artifact itself) */
		children?: Snippet
		/** Props row in the footer — key/value metadata about the artifact */
		props?: Snippet
		/** Action buttons in the footer (copy, download, etc.) */
		actions?: Snippet
		/** When true, body has zero padding (artifact controls its own padding) */
		flush?: boolean
	}

	const {
		name,
		meta,
		kicker,
		kickerColor,
		icon,
		children,
		props,
		actions,
		flush = false
	}: ChatResponseProps = $props()

	const kickerStyle = $derived(
		kickerColor
			? `--chat-response-kicker: ${kickerColor};`
			: undefined
	)
</script>

<div data-chat-response>
	<div data-chat-response-header>
		<div data-chat-response-title>
			{#if icon}
				<span data-chat-response-icon>{@render icon()}</span>
			{/if}
			<span data-chat-response-name>{name}</span>
			{#if meta}<span data-chat-response-meta>{meta}</span>{/if}
		</div>
		{#if kicker}
			<span data-chat-response-kicker style={kickerStyle}>{kicker}</span>
		{/if}
	</div>

	<div data-chat-response-body data-flush={flush ? '' : undefined}>
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if props || actions}
		<div data-chat-response-footer>
			<div data-chat-response-props>
				{#if props}{@render props()}{/if}
			</div>
			<div data-chat-response-actions>
				{#if actions}{@render actions()}{/if}
			</div>
		</div>
	{/if}
</div>
