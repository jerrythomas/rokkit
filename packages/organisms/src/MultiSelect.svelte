<script>
	import Select from './Select.svelte'
	import { ItemWrapper, Item } from '@rokkit/molecules'
	import { defaultFields } from '@rokkit/core'

	let className = ''
	export { className as class }
	export let value = []
	export let options = []
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = {}
	export let using = {}
	export let placeholder = ''

	$: available = options.filter((item) => !value.includes(item))

	function handleRemove(event) {
		value = [...value.filter((item) => item != event.detail)]
	}
	function handleSelect(event) {
		if (!value.includes(event.detail)) value = [...value, event.detail]
	}
	$: using = { default: Item, ...using }
	$: fields = { ...defaultFields, ...fields }
</script>

<Select
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
		<item class="w-full flex">
			<svelte:component this={using.default} value={placeholder} />
		</item>
	{/if}
</Select>
