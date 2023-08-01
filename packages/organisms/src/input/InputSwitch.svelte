<script>
	import { createEventDispatcher } from 'svelte'
	import { getValue, defaultFields } from '@rokkit/core'
	import Switch from '../Switch.svelte'

	const dispatch = createEventDispatcher()
	export let name
	export let value
	export let options
	export let fields = {}

	let selected

	function handle(event) {
		value = getValue(event.detail.item, fields)
		dispatch('change', event.detail)
	}

	$: fields = { ...defaultFields, ...fields }
	$: if (value !== getValue(selected, fields)) {
		selected = options.find((option) => getValue(option, fields) === value)
	}
</script>

<input {name} type="hidden" bind:value />
<Switch
	value={selected}
	{options}
	{fields}
	{...$$restProps}
	on:change={handle}
/>
