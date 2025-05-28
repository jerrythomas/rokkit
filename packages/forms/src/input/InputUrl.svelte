<script>
	/**
	 * @typedef {Object} InputUrlProps
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
	 */

	/** @type {InputUrlProps & { [key: string]: any }} */
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
		...rest
	} = $props()
</script>

<input
	bind:value
	type="url"
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
	{onchange}
	{onfocus}
	{onblur}
	{...rest}
/>
