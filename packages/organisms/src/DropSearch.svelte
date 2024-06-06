<script>
	import { defaultFields, getText } from '@rokkit/core'
	import Select from './Select.svelte'

	export let options
	export let name = null
	export let value = null
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = defaultFields

	let searchText
	let searchBox
	let filtered = options

	$: fields = { ...defaultFields, ...fields }

	function applySearch(event) {
		searchText = event.target.value
		if (searchText) {
			filtered = options.filter((option) =>
				getText(option, fields).toLowerCase().includes(searchText.toLowerCase())
			)
		} else filtered = options
	}
	function handleSelect(event) {
		value = event.detail
		searchText = getText(event.detail, fields)
	}
</script>

<Select {name} bind:value options={filtered} {...$$restProps} {fields} on:select={handleSelect}>
	<span class="flex flex-grow">
		<input
			type="text"
			class="w-full border-none bg-transparent p-0"
			bind:value={searchText}
			bind:this={searchBox}
			on:change={applySearch}
		/>
	</span>
</Select>
