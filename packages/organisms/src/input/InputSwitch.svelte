<script>
	import { createEventDispatcher } from 'svelte'
	import { getId } from '@rokkit/core'
	import Switch from '../Switch.svelte'

	const dispatch = createEventDispatcher()
	export let name
	export let value
	export let options
	export let fields

	let selected

	function handle(event) {
		value = getId(event.detail.item, fields)
		dispatch('change', event.detail)
	}

	$: if (value !== getId(selected, fields)) {
		selected = options.find((option) => getId(option, fields) === value)
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
