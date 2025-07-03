<script>
	import { getValue, defaultFields } from '@rokkit/core'
	import Switch from '../Switch.svelte'

	let { name, value, options, fields, onchange, ...restProps } = $props()
	// let selected = $state(null)
	let configFields = $derived({ ...defaultFields, ...fields })
	function handle(data) {
		value = getValue(data.value, configFields)
		onchange?.(data.value)
	}
	let selected = $derived(options.find((option) => getValue(option, configFields) === value))
	// $effect(() => {
	// 	selected = options.find((option) => getValue(option, configFields) === value)
	// })
</script>

<input {name} type="hidden" bind:value />
<Switch bind:value={selected} {options} {fields} {...restProps} onchange={handle} />
