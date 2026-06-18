<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { ProxyItem } from '@rokkit/states'
	import { Wrapper, ProxyTree } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'

	interface SwatchProps {
		/** Color options — primitives (hex/name strings) or objects with mapped fields */
		options?: Array<string | number | Record<string, unknown>>
		/** Field mapping for object options (value, fill, stroke, …) */
		fields?: Record<string, string>
		/** Selected value (bindable). Array when `multiple`. */
		value?: unknown
		/** Allow multiple selection */
		multiple?: boolean
		/** Swatch shape */
		shape?: 'square' | 'circle'
		/** Size variant */
		size?: 'sm' | 'md' | 'lg'
		/** Disable the whole group */
		disabled?: boolean
		/** Accessible group label */
		label?: string
		/** Additional CSS classes */
		class?: string
		/** Called when selection changes */
		onchange?: (value: unknown, item: unknown) => void
		/** Custom snippet for rendering a swatch (receives proxy + selected) */
		item?: Snippet<[ProxyItem, boolean]>
		[key: string]: unknown
	}

	let {
		options = [],
		fields: userFields = {},
		value = $bindable(),
		multiple = false,
		shape = 'square',
		size = 'md',
		disabled = false,
		label = 'Select',
		class: className = '',
		onchange,
		item: itemSnippet,
		..._rest
	}: SwatchProps = $props()

	const proxyTree = $derived(new ProxyTree(options, userFields))
	const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect }))

	let containerRef = $state<HTMLElement | null>(null)

	$effect(() => {
		if (!containerRef) return
		const nav = new Navigator(containerRef, wrapper, { orientation: 'horizontal' })
		return () => nav.destroy()
	})

	$effect(() => {
		wrapper.moveToValue(value)
	})

	function isSelected(proxy: ProxyItem) {
		if (multiple && Array.isArray(value)) return value.includes(proxy.value)
		return proxy.value === value
	}

	function toggleMultiValue(extracted: unknown, original: unknown) {
		const arr = Array.isArray(value) ? [...value] : []
		const idx = arr.indexOf(extracted)
		if (idx >= 0) arr.splice(idx, 1)
		else arr.push(extracted)
		value = arr
		onchange?.(value, original)
	}

	function selectSingleValue(extracted: unknown, original: unknown) {
		if (extracted === value) return
		value = extracted
		onchange?.(extracted, original)
	}

	function handleSelect(extracted: unknown, proxy: ProxyItem) {
		if (proxy.disabled || disabled) return
		if (multiple) toggleMultiValue(extracted, proxy.original)
		else selectSingleValue(extracted, proxy.original)
	}
</script>

<div
	bind:this={containerRef}
	data-swatch
	data-swatch-size={size}
	data-swatch-shape={shape}
	data-swatch-disabled={disabled || undefined}
	data-swatch-multiple={multiple || undefined}
	role={multiple ? 'group' : 'radiogroup'}
	aria-label={label}
	aria-disabled={disabled || undefined}
	class={className || undefined}
>
	{#each wrapper.flatView as node (node.key)}
		{@const proxy = node.proxy}
		{@const sel = isSelected(proxy)}
		{@const fill = proxy.get(userFields.fill ?? 'fill')}
		{@const stroke = proxy.get(userFields.stroke ?? 'stroke')}
		<button
			type="button"
			data-swatch-item
			data-path={node.key}
			data-selected={sel || undefined}
			data-disabled={proxy.disabled || undefined}
			role={multiple ? 'checkbox' : 'radio'}
			aria-checked={sel}
			aria-label={proxy.label}
			title={proxy.label}
			disabled={proxy.disabled || disabled}
			style={fill ? `--swatch-fill:${fill};--swatch-stroke:${stroke ?? fill}` : undefined}
		>
			{#if itemSnippet}
				{@render itemSnippet(proxy, sel)}
			{:else if shape === 'circle'}
				<span data-swatch-circle></span>
			{:else}
				<span data-swatch-square></span>
			{/if}
		</button>
	{/each}
</div>
