<script lang="ts">
	import { getItemAtIndex, getIndexForItem, noop, type FieldMapping } from '@rokkit/core'
	import { ProxyItem } from '@rokkit/states'

	type Props = {
		class?: string
		value?: unknown
		fields?: FieldMapping
		options?: unknown[]
		disabled?: boolean
		flip?: boolean
		onchange?: (value: unknown) => void
		onfocus?: (event: FocusEvent) => void
		onblur?: (event: FocusEvent) => void
		[key: string]: unknown
	}

	let {
		class: className = '',
		value = $bindable(),
		fields,
		options = [],
		disabled = false,
		onchange = noop,
		onfocus,
		onblur,
		...rest
	}: Props = $props()

	let currentIndex = $derived(getIndexForItem(options, value))

	const handleChange = () => {
		value = getItemAtIndex(options, currentIndex)
		onchange?.(value)
	}
</script>

<radio-group class={className} class:disabled>
	{#each options as item, index (index)}
		{@const proxy = new ProxyItem(item, fields)}
		<label class="flex flex-row items-center gap-2 rtl:flex-row-reverse">
			<input
				type="radio"
				{...rest}
				bind:group={currentIndex}
				value={index}
				{disabled}
				onchange={handleChange}
				{onfocus}
				{onblur}
			/>
			<p>{proxy.label}</p>
		</label>
	{/each}
</radio-group>
