<script>
	import { createEventDispatcher } from 'svelte'
	import { getId, defaultFields } from '@rokkit/core'
	import Select from '../Select.svelte'

	const dispatch = createEventDispatcher()
	export let name
	export let value = null
	export let options = []
	export let fields = defaultFields

	let selected

	function handle(event) {
		value = getId(event.detail, fields)
		dispatch('change', event.detail)
	}

	$: if (value !== getId(selected, fields)) {
		selected = options.find((option) => getId(option, fields) === value)
	}
</script>

<input {name} type="hidden" bind:value />
<Select
	value={selected}
	{options}
	{fields}
	{...$$restProps}
	on:change={handle}
/>
