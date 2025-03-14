<script>
	import { defaultFields } from '@rokkit/core'
	import Select from '../Select.svelte'

	let { name, value, options = [], fields = defaultFields, onchange, ...restProps } = $props()

	let selected

	function handle(event) {
		// value = getValue(event.detail, fields)
		// dispatch('change', event.detail)
	}

	// $effect(() => {
	// 	if (value !== getValue(selected, fields)) {
	// 		selected = options.find((option) => getValue(option, fields) === value)
	// 	}
	// })
</script>

<input {name} type="hidden" bind:value />
<Select name="" value={selected} {options} {fields} {...restProps} onchange={handle} />
