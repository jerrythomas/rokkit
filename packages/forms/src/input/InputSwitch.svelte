<script>
	import { getValue, defaultFields } from '@rokkit/core'
	import { Toggle } from '@rokkit/ui'

	/**
	 * @typedef {Object} InputSwitchProps
	 * @property {string} name
	 * @property {any} value
	 * @property {Array<Object>} options
	 * @property {Object} fields
	 * @property {Function} onchange
	 */

	/** @type {InputSwitchProps & { [key: string]: any }} */
	let { name, value = $bindable(), options, fields, onchange, ...restProps } = $props()

	let configFields = $derived({ ...defaultFields, ...fields })

	function handle(itemValue, item) {
		value = getValue(item, configFields)
		onchange?.(item)
	}
</script>

<input {name} type="hidden" bind:value />
<Toggle {options} fields={configFields} bind:value {onchange} {...restProps} />
