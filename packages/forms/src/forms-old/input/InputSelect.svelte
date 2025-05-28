<script>
	import { getValue, defaultFields } from '@rokkit/core'
	import Select from '../Select.svelte'

	let { name, value, options = [], fields, onchange, ...restProps } = $props()

	let selected = $state()
	let configFields = $derived({ ...defaultFields, ...fields })

	function handle(data) {
		value = getValue(data.value, configFields)
		onchange?.(data)
	}

	$effect(() => {
		if (value !== getValue(selected, configFields)) {
			selected = options.find((option) => getValue(option, configFields) === value)
		}
	})
</script>

<input {name} type="hidden" bind:value />
<Select name="" value={selected} {options} {fields} {...restProps} onchange={handle} />
