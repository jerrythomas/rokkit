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

	function handleChange(event) {
		value = event.target.value
		onchange?.(value)
	}
</script>

<input
	bind:value
	type="color"
	{required}
	{disabled}
	{name}
	{id}
	{autocomplete}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
