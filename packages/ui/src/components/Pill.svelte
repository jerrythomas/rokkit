<script lang="ts">
	import type { Snippet } from 'svelte'
	import { ItemProxy, type ItemFields } from '../types/item-proxy.js'
	import { keyboard } from '@rokkit/actions'

	interface PillProps {
		/** Item data (string or object) */
		value: unknown
		/** Custom field mappings */
		fields?: Partial<ItemFields>
		/** Show remove button */
		removable?: boolean
		/** Disabled state */
		disabled?: boolean
		/** Called when remove is triggered (click or Delete/Backspace key) */
		onremove?: (value: unknown) => void
		/** Custom content snippet */
		content?: Snippet<[ItemProxy]>
		/** Additional CSS class */
		class?: string
	}

	const {
		value,
		fields,
		removable = false,
		disabled = false,
		onremove,
		content,
		class: className = ''
	}: PillProps = $props()

	const proxy = $derived(
		new ItemProxy(
			typeof value === 'string' ? { text: value, value } : (value as Record<string, unknown>),
			fields
		)
	)

	const keyMap = $derived(removable && !disabled ? { remove: ['Delete', 'Backspace'] } : {})

	function handleRemove() {
		if (!disabled) {
			onremove?.(value)
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
	data-pill
	data-pill-disabled={disabled || undefined}
	class={className || undefined}
	use:keyboard={keyMap}
	onremove={handleRemove}
	tabindex={removable && !disabled ? 0 : undefined}
>
	{#if content}
		{@render content(proxy)}
	{:else}
		{#if proxy.icon}
			<span data-pill-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span data-pill-text>{proxy.text}</span>
	{/if}

	{#if removable}
		<button
			data-pill-remove
			type="button"
			aria-label="Remove {proxy.text}"
			{disabled}
			onclick={handleRemove}
		>
			<span class="i-lucide:x" aria-hidden="true"></span>
		</button>
	{/if}
</span>
