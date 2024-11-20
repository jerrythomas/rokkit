<script>
	import { defaultFields, getText } from '@rokkit/core'
	import Select from './Select.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} options
	 * @property {any} [name]
	 * @property {any} [value]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		options,
		name = null,
		value = $bindable(null),
		fields = $bindable(defaultFields),
		...rest
	} = $props()

	let searchText = $state()
	// let searchBox = $state()
	let filtered = $state(options)

	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
	})

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

<Select {name} bind:value options={filtered} {...rest} {fields} on:select={handleSelect}>
	<span class="flex flex-grow">
		<input
			type="text"
			class="w-full border-none bg-transparent p-0"
			bind:value={searchText}
			onchange={applySearch}
		/>
		<!-- bind:this={searchBox} -->
	</span>
</Select>
