<script>
	import { getValue, defaultFields, createEmitter } from '@rokkit/core'
	import Switch from '../Switch.svelte'

	let { name, value = $bindable(), options, fields = $bindable({}), ...rest } = $props()

	let selected = $state()
	let emitter = createEmitter(rest, ['change'])
	function handle(event) {
		value = getValue(event.detail.item, fields)
		emitter.change(event.detail)
	}

	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
		if (value !== getValue(selected, fields)) {
			selected = options.find((option) => getValue(option, fields) === value)
		}
	})
</script>

<input {name} type="hidden" bind:value />
<Switch bind:value={selected} {options} {fields} {...rest} onchange={handle} />
