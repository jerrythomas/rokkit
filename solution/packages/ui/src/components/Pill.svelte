<script lang="ts">
	import type { Snippet } from 'svelte'
	import { ProxyItem } from '@rokkit/states'
	import { keyboard } from '@rokkit/actions'

	interface PillProps {
		/** Item data (string or object) */
		value: unknown
		/** Custom field mappings */
		fields?: Record<string, string>
		/** Show remove button */
		removable?: boolean
		/** Disabled state */
		disabled?: boolean
		/** Called when remove is triggered (click or Delete/Backspace key) */
		onremove?: (value: unknown) => void
		/** Custom content snippet */
		content?: Snippet<[ProxyItem]>
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

	const proxy = $derived(new ProxyItem(value, fields))

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
		{#if proxy.get('icon')}
			<span data-pill-icon class={proxy.get('icon')} aria-hidden="true"></span>
		{/if}
		<span data-pill-text>{proxy.label}</span>
	{/if}

	{#if removable}
		<button
			data-pill-remove
			type="button"
			aria-label="Remove {proxy.label}"
			{disabled}
			onclick={handleRemove}
		>
			<span class="i-lucide:x" aria-hidden="true"></span>
		</button>
	{/if}
</span>
