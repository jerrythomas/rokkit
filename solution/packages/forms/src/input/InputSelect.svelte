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
		size,
		onchange,
		..._rest
	} = $props()

	// Check if options include an empty string (used as "none" option)
	const hasEmptyOption = $derived(options.some((opt) => opt === '' || (typeof opt === 'object' && opt?.value === '')))

	// Filter out empty strings — Select + ItemProxy handles string options natively
	const filteredOptions = $derived(
		hasEmptyOption
			? options.filter((opt) => opt !== '' && !(typeof opt === 'object' && opt?.value === ''))
			: options
	)

	// Use placeholder for empty option, or provide a default clear label
	const effectivePlaceholder = $derived(hasEmptyOption ? (placeholder || 'None') : placeholder)
</script>

<Select
	items={filteredOptions}
	{fields}
	bind:value
	placeholder={effectivePlaceholder}
	{disabled}
	{size}
	{onchange}
/>
