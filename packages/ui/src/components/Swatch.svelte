<script lang="ts">
	// @ts-nocheck
	import { Wrapper, ProxyTree, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'

	let {
		options = [],
		fields: userFields = {},
		value = $bindable(),
		multiple = false,
		shape = 'square',
		size = 'md',
		disabled = false,
		label = messages.current.swatch?.label ?? 'Select',
		class: className = '',
		onchange,
		item: itemSnippet,
		..._rest
	} = $props()

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

	function isSelected(proxy) {
		if (multiple && Array.isArray(value)) return value.includes(proxy.value)
		return proxy.value === value
	}

	function toggleMultiValue(extracted, original) {
		const arr = Array.isArray(value) ? [...value] : []
		const idx = arr.indexOf(extracted)
		if (idx >= 0) arr.splice(idx, 1)
		else arr.push(extracted)
		value = arr
		onchange?.(value, original)
	}

	function selectSingleValue(extracted, original) {
		if (extracted === value) return
		value = extracted
		onchange?.(extracted, original)
	}

	function handleSelect(extracted, proxy) {
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
