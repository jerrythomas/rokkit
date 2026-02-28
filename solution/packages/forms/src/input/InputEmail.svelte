<script>
	/**
	 * @typedef {Object} InputEmailProps
	 * @property {string} value
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 * @property {string} placeholder
	 * @property {boolean} required
	 * @property {boolean} disabled
	 * @property {boolean} readonly
	 * @property {string} name
	 * @property {string} id
	 * @property {string} autocomplete
	 * @property {number} maxlength
	 * @property {number} minlength
	 * @property {string} pattern
	 * @property {number} size
	 * @property {boolean} multiple
	 */

	/** @type {InputEmailProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		placeholder,
		required,
		disabled,
		readonly,
		name,
		id,
		autocomplete,
		maxlength,
		minlength,
		pattern,
		size,
		multiple,
		...rest
	} = $props()

	function handleChange(event) {
		value = event.target.value
		onchange?.(value)
	}
</script>

<input
	bind:value
	type="email"
	{placeholder}
	{required}
	{disabled}
	{readonly}
	{name}
	{id}
	{autocomplete}
	{maxlength}
	{minlength}
	{pattern}
	{size}
	{multiple}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
