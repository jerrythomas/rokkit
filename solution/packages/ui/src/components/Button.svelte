<script lang="ts">
	import type { ButtonProps } from '../types/button.js'
	import { ItemProxy } from '../types/item-proxy.js'
	import ItemContent from './ItemContent.svelte'

	let {
		variant = 'default',
		style = 'default',
		size = 'md',
		type = 'button',
		label,
		icon,
		iconRight,
		href,
		target,
		disabled = false,
		loading = false,
		onclick,
		class: className = '',
		children
	}: ButtonProps = $props()

	const isIconOnly = $derived(Boolean(icon) && !label && !children)
	const isDisabled = $derived(disabled || loading)

	/**
	 * Create an ItemProxy for default content rendering.
	 * Constructs a minimal item from button props.
	 */
	const proxy = $derived(
		new ItemProxy({ text: label, icon, iconRight }, { text: 'text', icon: 'icon' })
	)
</script>

{#snippet defaultContent()}
	{#if loading}
		<span data-button-spinner aria-hidden="true"></span>
	{/if}
	<ItemContent {proxy} />
	{#if iconRight}
		<span data-button-icon-right class={iconRight} aria-hidden="true"></span>
	{/if}
{/snippet}

{#if href && !isDisabled}
	<a
		{href}
		{target}
		data-button
		data-variant={variant}
		data-style={style}
		data-size={size}
		data-icon-only={isIconOnly || undefined}
		data-loading={loading || undefined}
		class={className || undefined}
		aria-label={label}
		aria-busy={loading || undefined}
	>
		{#if children}
			{@render children()}
		{:else}
			{@render defaultContent()}
		{/if}
	</a>
{:else}
	<button
		{type}
		data-button
		data-variant={variant}
		data-style={style}
		data-size={size}
		data-disabled={isDisabled || undefined}
		data-icon-only={isIconOnly || undefined}
		data-loading={loading || undefined}
		class={className || undefined}
		disabled={isDisabled}
		aria-label={label}
		aria-busy={loading || undefined}
		{onclick}
	>
		{#if children}
			{@render children()}
		{:else}
			{@render defaultContent()}
		{/if}
	</button>
{/if}
