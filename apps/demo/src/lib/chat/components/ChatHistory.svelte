<script lang="ts">
	import type { Snippet } from 'svelte'

	interface ChatHistoryProps {
		/** Collapsed state — bindable */
		collapsed?: boolean
		/** Search query — bindable */
		searchQuery?: string
		/** Fires when the "New conversation" button is clicked */
		onnew?: () => void
		/** Fires when the search input value changes */
		onsearch?: (query: string) => void
		/** Sidebar body content (conversation list etc.) — full snippet for layout flexibility */
		children?: Snippet
		/** Compact body shown when collapsed (icon-only list) */
		collapsedBody?: Snippet
		/** Footer snippet */
		footer?: Snippet
		/** Label for the new-conversation button (i18n hook) */
		newLabel?: string
		/** Placeholder for the search input */
		searchPlaceholder?: string
	}

	let {
		collapsed = $bindable(false),
		searchQuery = $bindable(''),
		onnew,
		onsearch,
		children,
		collapsedBody,
		footer,
		newLabel = 'New conversation',
		searchPlaceholder = 'Search past · docs · components'
	}: ChatHistoryProps = $props()

	function toggleCollapsed() {
		collapsed = !collapsed
	}

	function handleSearchInput(e: Event) {
		const value = (e.currentTarget as HTMLInputElement).value
		searchQuery = value
		onsearch?.(value)
	}
</script>

<aside data-chat-history data-collapsed={collapsed ? '' : undefined}>
	<div data-chat-history-header>
		{#if !collapsed}
			<button
				type="button"
				data-chat-history-new
				onclick={onnew}
				title={newLabel}
				aria-label={newLabel}
			>
				<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
					<path d="M7 2 L7 12 M2 7 L12 7"/>
				</svg>
				<span data-chat-history-new-label>{newLabel}</span>
				<kbd>⌘N</kbd>
			</button>
		{/if}
		<button
			type="button"
			data-chat-history-collapse
			onclick={toggleCollapsed}
			title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"
				style:transform={collapsed ? 'rotate(180deg)' : 'none'}
				aria-hidden="true">
				<rect x="2" y="2.5" width="10" height="9" rx="1"/>
				<path d="M6 2.5 V11.5"/>
			</svg>
		</button>
	</div>

	{#if !collapsed}
		<div data-chat-history-search>
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
				<circle cx="7" cy="7" r="4.5"/>
				<path d="M10.5 10.5 L14 14"/>
			</svg>
			<input
				type="search"
				placeholder={searchPlaceholder}
				value={searchQuery}
				oninput={handleSearchInput}
				aria-label={searchPlaceholder}
			/>
			<kbd>⌘K</kbd>
		</div>
	{/if}

	<div data-chat-history-scroll>
		{#if collapsed}
			<button
				type="button"
				data-chat-history-new
				data-collapsed-action
				onclick={onnew}
				title={newLabel}
				aria-label={newLabel}
			>
				<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
					<path d="M7 2 L7 12 M2 7 L12 7"/>
				</svg>
			</button>
			{#if collapsedBody}
				{@render collapsedBody()}
			{/if}
		{:else if children}
			{@render children()}
		{/if}
	</div>

	{#if footer && !collapsed}
		<div data-chat-history-footer>{@render footer()}</div>
	{/if}
</aside>
