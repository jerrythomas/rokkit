<script>
	/**
	 * @typedef {Object} InputCheckboxProps
	 * @property {boolean} value
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 * @property {boolean} required
	 * @property {boolean} disabled
	 * @property {string} name
	 * @property {string} id
	 */

	/** @type {InputCheckboxProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		required,
		disabled,
		name,
		id,
		...rest
	} = $props()
</script>

<input
	type="checkbox"
	bind:checked={value}
	{required}
	{disabled}
	{name}
	{id}
	{onchange}
	{onfocus}
	{onblur}
	{...rest}
/>
