<script>
	import { Toggle } from '@rokkit/ui'

	/**
	 * @typedef {Object} InputToggleProps
	 * @property {any} value - Selected value (bindable)
	 * @property {Array<Object|string>} [options] - Options array (strings or objects)
	 * @property {Object} [fields] - Field mapping for option data
	 * @property {boolean} [disabled] - Whether the toggle is disabled
	 * @property {string} [size] - Size variant ('sm' | 'md' | 'lg')
	 * @property {boolean} [showLabels] - Show text labels
	 * @property {Function} [onchange] - Change callback
	 */

	/** @type {InputToggleProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		options = [],
		fields,
		disabled = false,
		size,
		showLabels,
		onchange,
		..._rest
	} = $props()
</script>

<Toggle {options} {fields} bind:value {onchange} {disabled} {size} {showLabels} />
