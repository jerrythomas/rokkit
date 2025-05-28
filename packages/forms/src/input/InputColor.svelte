<script>
	/**
	 * @typedef {Object} InputColorProps
	 * @property {string} value
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 * @property {boolean} required
	 * @property {boolean} disabled
	 * @property {string} name
	 * @property {string} id
	 * @property {string} autocomplete
	 */

	/** @type {InputColorProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		required,
		disabled,
		name,
		id,
		autocomplete,
		...rest
	} = $props()
</script>

<input
	bind:value
	type="color"
	{required}
	{disabled}
	{name}
	{id}
	{autocomplete}
	{onchange}
	{onfocus}
	{onblur}
	{...rest}
/>
