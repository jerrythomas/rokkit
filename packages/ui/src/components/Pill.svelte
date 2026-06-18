<script lang="ts">
	import { ProxyItem } from '@rokkit/states'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import type { PillIcons, PillProps } from '../types/pill.js'

	const {
		value,
		fields,
		removable = false,
		disabled = false,
		icons: userIcons = {} as PillIcons,
		onremove,
		content,
		class: className = ''
	}: PillProps = $props()

	const icons = $derived({ remove: DEFAULT_STATE_ICONS.action.remove, ...userIcons })

	const proxy = $derived(new ProxyItem(value, fields))

	function handleRemove() {
		if (!disabled) {
			onremove?.(value)
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!removable || disabled) return
		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault()
			handleRemove()
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
	data-pill
	data-pill-disabled={disabled || undefined}
	class={className || undefined}
	role={removable && !disabled ? 'button' : undefined}
	onkeydown={handleKeydown}
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
			<span data-pill-remove-icon class={icons.remove} aria-hidden="true"></span>
		</button>
	{/if}
</span>
