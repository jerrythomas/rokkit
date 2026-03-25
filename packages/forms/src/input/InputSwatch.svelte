<script>
	import { Swatch } from '@rokkit/ui'

	/**
	 * @typedef {Object} InputSwatchProps
	 * @property {any} value - Selected value (bindable); array when multiple=true
	 * @property {Array<Object|string>} [options] - Options array
	 * @property {Object} [fields] - Field mapping (label, value, disabled)
	 * @property {boolean} [multiple] - Multi-select mode
	 * @property {'square'|'circle'} [shape] - Default cell shape
	 * @property {'sm'|'md'|'lg'} [size] - Size variant
	 * @property {boolean} [disabled] - Disabled state
	 * @property {Function} [onchange] - Change callback
	 */

	/** @type {InputSwatchProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		options = [],
		fields,
		multiple = false,
		shape = 'square',
		size = 'md',
		disabled = false,
		onchange,
		..._rest
	} = $props()
</script>

<Swatch {options} {fields} bind:value {multiple} {shape} {size} {disabled} {onchange} />
