<script>
	import { Switch } from '@rokkit/ui'

	/**
	 * @typedef {Object} InputSwitchProps
	 * @property {string} name
	 * @property {any} value
	 * @property {[any, any]} options
	 * @property {Object} fields
	 * @property {Function} onchange
	 */

	/** @type {InputSwitchProps & { [key: string]: any }} */
	let { name, value = $bindable(), options, fields, onchange, ...restProps } = $props()
</script>

<input {name} type="hidden" bind:value />
<Switch {options} {fields} bind:value {onchange} {...restProps} />
