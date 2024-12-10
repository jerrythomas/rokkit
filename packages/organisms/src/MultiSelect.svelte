<script>
	import { run } from 'svelte/legacy'

	import Select from './Select.svelte'
	import { ItemWrapper, Item } from '@rokkit/molecules'
	import { defaultFields } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} name
	 * @property {any} [value]
	 * @property {any} [options]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [using]
	 * @property {string} [placeholder]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		name,
		value = $bindable([]),
		options = [],
		fields = $bindable({}),
		using = $bindable({}),
		placeholder = ''
	} = $props()

	let available = $derived(options.filter((item) => !value.includes(item)))

	function handleRemove(event) {
		value = [...value.filter((item) => item !== event.detail)]
	}
	function handleSelect(event) {
		if (!value.includes(event.detail)) value = [...value, event.detail]
	}
	run(() => {
		using = { default: Item, ...using }
	})
	run(() => {
		fields = { ...defaultFields, ...fields }
	})
</script>

<Select
	{name}
	options={available}
	{fields}
	{using}
	on:select={handleSelect}
	class={className}
	{placeholder}
>
	{#if value.length > 0}
		<items class="flex flex-wrap">
			{#each value as item}
				<ItemWrapper
					value={item}
					{fields}
					{using}
					removable
					on:remove={handleRemove}
					class="pill"
				/>
			{/each}
		</items>
	{:else}
		<item class="flex w-full">
			<using.default value={placeholder} />
		</item>
	{/if}
</Select>
