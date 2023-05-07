<script>
	import Select from './Select.svelte'
	import { Pill, Text } from '@rokkit/core'
	import { defaultFields } from '@rokkit/core'

	let className = ''
	export { className as class }
	export let value = []
	export let items = []
	export let fields = {}
	export let using = {}
	export let placeholder = ''

	$: available = items.filter((item) => !value.includes(item))

	function handleRemove(event) {
		value = [...value.filter((item) => item != event.detail)]
	}
	function handleSelect(event) {
		value = [...value, event.detail]
	}
	$: using = { default: Text, ...using }
	$: fields = { ...defaultFields, ...fields }
</script>

<Select
	items={available}
	{fields}
	{using}
	searchable
	on:select={handleSelect}
	class={className}
	{placeholder}
>
	{#if value.length > 0}
		<items class="flex flex-wrap">
			{#each value as item}
				<Pill
					value={item}
					{fields}
					{using}
					removable
					on:remove={handleRemove}
				/>
			{/each}
		</items>
	{:else}
		<item class="flex w-full">
			<svelte:component this={using.default} value={placeholder} />
		</item>
	{/if}
</Select>
