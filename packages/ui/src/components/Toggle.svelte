<script lang="ts">
	// @ts-nocheck
	import type { ToggleProps } from '../types/toggle.js'
	import { Wrapper, ProxyTree, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'
	import { resolveSnippet } from '@rokkit/core'

	let {
		variant = 'group',
		options = [],
		fields: userFields = {},
		value = $bindable(),
		onchange,
		showLabels = true,
		size = 'md',
		disabled = false,
		label = messages.toggle.label,
		class: className = '',
		...snippets
	}: ToggleProps & { [key: string]: unknown } = $props()

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	const proxyTree = $derived(new ProxyTree(options, userFields))
	const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect }))

	// ─── Navigator (horizontal — only for group variant) ───────────────────────

	let containerRef = $state<HTMLElement | null>(null)

	$effect(() => {
		if (!containerRef || variant !== 'group') return
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

	// ─── Button variant — derive the next option in the cycle ─────────────────
	// The single button represents the NEXT value (what you'd switch to on click).
	// We compute the index of the current value, then point at index+1 (mod len).

	const nodes = $derived(wrapper.flatView)
	const currentIndex = $derived(nodes.findIndex((n) => n.proxy.value === value))
	const nextIndex = $derived(
		nodes.length === 0 ? -1 : (currentIndex >= 0 ? (currentIndex + 1) % nodes.length : 0)
	)
	const nextNode = $derived(nextIndex >= 0 ? nodes[nextIndex] : null)

	function cycle() {
		if (disabled || !nextNode) return
		const proxy = nextNode.proxy
		handleSelect(proxy.value, proxy)
	}
</script>

{#if variant === 'button'}
	{@const proxy = nextNode?.proxy}
	{@const content = proxy ? resolveSnippet(snippets, proxy) : null}
	<button
		type="button"
		data-toggle
		data-toggle-variant="button"
		data-toggle-size={size}
		data-toggle-disabled={disabled || undefined}
		data-toggle-labels={showLabels || undefined}
		class={className || undefined}
		title={proxy?.get('description') || proxy?.label || label}
		aria-label={proxy?.label || label}
		disabled={disabled || !proxy}
		onclick={cycle}
	>
		{#if proxy}
			{#if content}
				{@render content(proxy, false)}
			{:else}
				{#if proxy.get('icon')}
					<span data-toggle-icon class={proxy.get('icon')} aria-hidden="true"></span>
				{/if}
				{#if showLabels && proxy.label}
					<span data-toggle-label>{proxy.label}</span>
				{/if}
			{/if}
		{/if}
	</button>
{:else}
	<div
		bind:this={containerRef}
		data-toggle
		data-toggle-variant="group"
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
{/if}
