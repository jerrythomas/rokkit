<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte'
	import { getValue, defaultFields } from '@rokkit/core'
	import Switch from '../Switch.svelte'

	const dispatch = createEventDispatcher()
	let {
		name,
		value = $bindable(),
		options,
		fields = $bindable({}),
		...rest
	} = $props();

	let selected = $state()

	function handle(event) {
		value = getValue(event.detail.item, fields)
		dispatch('change', event.detail)
	}

	run(() => {
		fields = { ...defaultFields, ...fields }
	});
	run(() => {
		if (value !== getValue(selected, fields)) {
			selected = options.find((option) => getValue(option, fields) === value)
		}
	});
</script>

<input {name} type="hidden" bind:value />
<Switch value={selected} {options} {fields} {...rest} on:change={handle} />
