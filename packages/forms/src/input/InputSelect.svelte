<script>
	import { Select } from '@rokkit/ui'

	/**
	 * @typedef {Object} InputSelectProps
	 * @property {any} value - Selected value (bindable)
	 * @property {Object} [fields] - Field mapping for options
	 * @property {Array<Object|string>} [options] - Static options array (strings or objects)
	 * @property {string} [placeholder] - Placeholder text
	 * @property {boolean} [disabled] - Whether the select is disabled
	 * @property {string} [size] - Size variant
	 * @property {Function} [onchange] - Change callback
	 */

	/** @type {InputSelectProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		fields,
		options = [],
		placeholder,
		disabled = false,
		size = 'sm',
		onchange,
		...rest
	} = $props()

	// Normalize string arrays to { text, value } objects
	const normalizedOptions = $derived(
		options.map((opt) =>
			typeof opt === 'string' ? { text: opt, value: opt } : opt
		)
	)
</script>

<Select
	options={normalizedOptions}
	{fields}
	bind:value
	{placeholder}
	{disabled}
	{size}
	{onchange}
/>
