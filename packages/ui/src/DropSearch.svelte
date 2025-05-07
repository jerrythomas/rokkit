<script>
	import { defaultFields, getText } from '@rokkit/core'
	import Select from './Select.svelte'

	let { options, name, value, fields = defaultFields, ...restProps } = $props()

	let searchText = $state('')
	let searchBox
	let filtered = $state(options)

	fields = { ...defaultFields, ...fields }

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

<Select {name} bind:value bind:options={filtered} {...restProps} {fields} onselect={handleSelect}>
	<span class="flex flex-grow">
		<input
			type="text"
			class="w-full border-none bg-transparent p-0"
			bind:value={searchText}
			bind:this={searchBox}
			onchange={applySearch}
		/>
	</span>
</Select>
