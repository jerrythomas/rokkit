<script>
	import { getValue, defaultFields, createEmitter } from '@rokkit/core'
	import Select from '../Select.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} name
	 * @property {any} [value]
	 * @property {any} [options]
	 * @property {any} [fields]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { name, value = $bindable(null), options = [], fields = defaultFields, ...rest } = $props()

	let selected = $state()
	let emitter = createEmitter(rest, ['change'])

	function handle(data) {
		value = getValue(data, fields)
		emitter.change(data)
	}

	$effect.pre(() => {
		if (value !== getValue(selected, fields)) {
			selected = options.find((option) => getValue(option, fields) === value)
		}
	})
</script>

<input {name} type="hidden" bind:value />
<Select name="" value={selected} {options} {fields} {...rest} onchange={handle} />
