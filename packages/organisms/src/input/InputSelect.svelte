<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte'
	import { getValue, defaultFields } from '@rokkit/core'
	import Select from '../Select.svelte'

	const dispatch = createEventDispatcher()
	/**
	 * @typedef {Object} Props
	 * @property {any} name
	 * @property {any} [value]
	 * @property {any} [options]
	 * @property {any} [fields]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		name,
		value = $bindable(null),
		options = [],
		fields = defaultFields,
		...rest
	} = $props();

	let selected = $state()

	function handle(event) {
		value = getValue(event.detail, fields)
		dispatch('change', event.detail)
	}

	run(() => {
		if (value !== getValue(selected, fields)) {
			selected = options.find((option) => getValue(option, fields) === value)
		}
	});
</script>

<input {name} type="hidden" bind:value />
<Select name="" value={selected} {options} {fields} {...rest} on:change={handle} />
