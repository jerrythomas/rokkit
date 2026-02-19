<script lang="ts">
	import type { ToggleProps, ToggleItem, ToggleItemHandlers } from '../types/toggle.js'
	import { ItemProxy } from '../types/item-proxy.js'

	const {
		options = [],
		fields: userFields,
		value,
		onchange,
		showLabels = true,
		size = 'md',
		disabled = false,
		class: className = '',
		item: itemSnippet
	}: ToggleProps = $props()

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: ToggleItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	/**
	 * Check if an item is currently selected
	 */
	function isSelected(proxy: ItemProxy): boolean {
		return proxy.itemValue === value
	}

	/**
	 * Handle item selection
	 */
	function handleSelect(proxy: ItemProxy) {
		if (proxy.disabled || disabled) return
		const itemValue = proxy.itemValue
		if (itemValue !== value) {
			onchange?.(itemValue, proxy.original as ToggleItem)
		}
	}

	/**
	 * Handle keyboard events
	 */
	function handleKeyDown(event: KeyboardEvent, proxy: ItemProxy) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleSelect(proxy)
		}
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy): ToggleItemHandlers {
		return {
			onclick: () => handleSelect(proxy),
			onkeydown: (event: KeyboardEvent) => handleKeyDown(event, proxy)
		}
	}
</script>

{#snippet defaultOption(proxy: ItemProxy, handlers: ToggleItemHandlers, selected: boolean)}
	<button
		type="button"
		data-toggle-option
		data-selected={selected || undefined}
		data-disabled={proxy.disabled || undefined}
		role="radio"
		aria-checked={selected}
		aria-label={proxy.text}
		title={proxy.description || proxy.text}
		disabled={proxy.disabled || disabled}
		onclick={handlers.onclick}
		onkeydown={handlers.onkeydown}
	>
		{#if proxy.icon}
			<span data-toggle-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		{#if showLabels && proxy.text}
			<span data-toggle-label>{proxy.text}</span>
		{/if}
	</button>
{/snippet}

<div
	data-toggle
	data-toggle-size={size}
	data-toggle-disabled={disabled || undefined}
	data-toggle-labels={showLabels || undefined}
	class={className || undefined}
	role="radiogroup"
	aria-label="Selection"
	aria-disabled={disabled || undefined}
>
	{#each options as option, index (index)}
		{@const proxy = createProxy(option)}
		{@const selected = isSelected(proxy)}
		{@const handlers = createHandlers(proxy)}

		{#if itemSnippet}
			{@render itemSnippet(option, userFields ?? {}, handlers, selected)}
		{:else}
			{@render defaultOption(proxy, handlers, selected)}
		{/if}
	{/each}
</div>
