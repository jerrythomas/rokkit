<script lang="ts">
	// @ts-nocheck
	import type { ToggleProps } from '../types/toggle.js'
	import { Wrapper, ProxyTree, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'
	import { resolveSnippet } from '@rokkit/core'

	let {
		options = [],
		fields: userFields = {},
		value = $bindable(),
		onchange,
		showLabels = true,
		size = 'md',
		disabled = false,
		label = messages.current.toggle.label,
		class: className = '',
		...snippets
	}: ToggleProps & { [key: string]: unknown } = $props()

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	const proxyTree = $derived(new ProxyTree(options, userFields))
	const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect }))

	// ─── Navigator (horizontal, always attached) ───────────────────────────────

	let containerRef = $state<HTMLElement | null>(null)

	$effect(() => {
		if (!containerRef) return
		const dir = getComputedStyle(containerRef).direction
		const nav = new Navigator(containerRef, wrapper, { orientation: 'horizontal', dir })
		return () => nav.destroy()
	})

	// ─── Sync external value → focused key ────────────────────────────────────

	$effect(() => {
		wrapper.moveToValue(value)
	})

	// ─── Selection handler ─────────────────────────────────────────────────────

	function handleSelect(extractedValue, proxy) {
		if (proxy.disabled || disabled) return
		if (extractedValue !== value) {
			value = extractedValue
			onchange?.(extractedValue, proxy.original)
		}
	}
</script>

<div
	bind:this={containerRef}
	data-toggle
	data-toggle-size={size}
	data-toggle-disabled={disabled || undefined}
	data-toggle-labels={showLabels || undefined}
	class={className || undefined}
	role="radiogroup"
	aria-label={label}
	aria-disabled={disabled || undefined}
>
	{#each wrapper.flatView as node (node.key)}
		{@const proxy = node.proxy}
		{@const sel = proxy.value === value}
		{@const content = resolveSnippet(snippets, proxy)}
		<button
			type="button"
			data-toggle-option
			data-path={node.key}
			data-selected={sel || undefined}
			data-disabled={proxy.disabled || undefined}
			role="radio"
			aria-checked={sel}
			aria-label={proxy.label}
			title={proxy.get('description') || proxy.label}
			disabled={proxy.disabled || disabled}
		>
			{#if content}
				{@render content(proxy, sel)}
			{:else}
				{#if proxy.get('icon')}
					<span data-toggle-icon class={proxy.get('icon')} aria-hidden="true"></span>
				{/if}
				{#if showLabels && proxy.label}
					<span data-toggle-label>{proxy.label}</span>
				{/if}
			{/if}
		</button>
	{/each}
</div>
