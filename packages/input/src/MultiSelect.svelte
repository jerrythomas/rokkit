<script>
	import Select from './Select.svelte'
	import { Pill } from '@svelte-spice/core'

	let className = ''
	export { className as class }
	export let value = []
	export let options = []
	export let fields = {}
	export let using = {}

	let available = options

	function handleRemove(event) {
		value = [...value.filter((item) => item == event.detail)]
		available = [...available, event.detail]
	}
	function handleSelect(event) {
		value = [...value, event.detail]
		available = [...available.filter((item) => item == event.detail)]
	}
</script>

<Select
	options={available}
	{fields}
	{using}
	searchable
	on:select={handleSelect}
	class={className}
>
	<items class="flex flex-wrap">
		{#each value as item}
			<Pill {item} {fields} remove on:remove={handleRemove} />
		{/each}
	</items>
</Select>
