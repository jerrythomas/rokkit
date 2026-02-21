<script lang="ts">
	import type { ToggleProps, ToggleItem, ToggleItemHandlers } from '../types/toggle.js'
	import { ItemProxy } from '../types/item-proxy.js'
	import { ListController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'

	let {
		options = [],
		fields: userFields,
		value = $bindable(),
		onchange,
		showLabels = true,
		size = 'md',
		disabled = false,
		class: className = '',
		item: itemSnippet
	}: ToggleProps = $props()

	// eslint-disable-next-line svelte/valid-compile -- initial capture is intentional
	let controller = new ListController(options, value, userFields)
	let containerRef: HTMLElement | null = $state(null)
	let lastSyncedValue: unknown = value

	$effect(() => {
		controller.update(options)
	})

	// Only sync controller focus when value prop changes externally,
	// not after every navigator move (focus !== selection in radiogroups)
	$effect(() => {
		if (value !== lastSyncedValue) {
			lastSyncedValue = value
			controller.moveToValue(value)
		}
	})

	// Focus the button matching controller.focusedKey on navigator move events
	$effect(() => {
		if (!containerRef) return
		const el = containerRef

		function handleAction(event: Event) {
			const detail = (event as CustomEvent).detail
			if (detail.name === 'move') {
				const key = controller.focusedKey
				if (key) {
					const target = el.querySelector(`[data-path="${key}"]`) as HTMLElement | null
					if (target && target !== document.activeElement) {
						target.focus()
					}
				}
			}
		}

		el.addEventListener('action', handleAction)
		return () => el.removeEventListener('action', handleAction)
	})

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
			value = itemValue
			lastSyncedValue = itemValue
			controller.moveToValue(itemValue)
			onchange?.(itemValue, proxy.original as ToggleItem)
		}
	}

	/**
	 * Handle keyboard events on individual options (Enter/Space)
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

{#snippet defaultOption(proxy: ItemProxy, handlers: ToggleItemHandlers, selected: boolean, key: string)}
	<button
		type="button"
		data-toggle-option
		data-path={key}
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={containerRef}
	data-toggle
	data-toggle-size={size}
	data-toggle-disabled={disabled || undefined}
	data-toggle-labels={showLabels || undefined}
	class={className || undefined}
	role="radiogroup"
	aria-label="Selection"
	aria-disabled={disabled || undefined}
	use:navigator={{ wrapper: controller, orientation: 'horizontal' }}
>
	{#each options as option, index (index)}
		{@const proxy = createProxy(option)}
		{@const selected = isSelected(proxy)}
		{@const handlers = createHandlers(proxy)}
		{@const key = String(index)}

		{#if itemSnippet}
			{@render itemSnippet(option, userFields ?? {}, handlers, selected)}
		{:else}
			{@render defaultOption(proxy, handlers, selected, key)}
		{/if}
	{/each}
</div>
