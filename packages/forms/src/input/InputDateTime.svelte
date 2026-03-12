<script>
	/**
	 * @typedef {Object} InputDateTimeProps
	 * @property {string} value
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 * @property {string} min
	 * @property {string} max
	 * @property {number} step
	 * @property {boolean} required
	 * @property {boolean} disabled
	 * @property {boolean} readonly
	 * @property {string} name
	 * @property {string} id
	 * @property {string} autocomplete
	 */

	/** @type {InputDateTimeProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		min,
		max,
		step,
		required,
		disabled,
		readonly,
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
	type="datetime-local"
	{min}
	{max}
	{step}
	{required}
	{disabled}
	{readonly}
	{name}
	{id}
	{autocomplete}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
