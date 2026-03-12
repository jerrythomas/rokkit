<script>
	/**
	 * @typedef {Object} InputNumberProps
	 * @property {number} value
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 * @property {number} min
	 * @property {number} max
	 * @property {number} step
	 * @property {string} placeholder
	 * @property {boolean} required
	 * @property {boolean} disabled
	 * @property {boolean} readonly
	 * @property {string} name
	 * @property {string} id
	 * @property {string} autocomplete
	 */

	/** @type {InputNumberProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		min,
		max,
		step,
		placeholder,
		required,
		disabled,
		readonly,
		name,
		id,
		autocomplete,
		...rest
	} = $props()

	function handleChange(event) {
		value = event.target.valueAsNumber
		onchange?.(value)
	}
</script>

<input
	bind:value
	type="number"
	{min}
	{max}
	{step}
	{placeholder}
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
