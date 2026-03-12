<script lang="ts">
	import type { ButtonProps } from '../types/button.js'
	import { ProxyItem } from '@rokkit/states'
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
		target = '_self',
		title,
		disabled = false,
		loading = false,
		onclick,
		class: className = '',
		children,
		...rest
	}: ButtonProps = $props()

	const isIconOnly = $derived(Boolean(icon) && !label && !children)
	const isDisabled = $derived(disabled || loading)

	/**
	 * Create a ProxyItem for default content rendering.
	 * Constructs a minimal item from button props.
	 */
	const proxy = $derived(
		new ProxyItem({ text: label, icon, iconRight })
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
		{title}
		data-button
		data-variant={variant}
		data-style={style}
		data-size={size}
		data-icon-only={isIconOnly || undefined}
		data-loading={loading || undefined}
		class={className || undefined}
		aria-label={label}
		aria-busy={loading || undefined}
		{...rest}
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
		{title}
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
		{...rest}
	>
		{#if children}
			{@render children()}
		{:else}
			{@render defaultContent()}
		{/if}
	</button>
{/if}
