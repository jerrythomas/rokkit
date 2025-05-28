<script>
	/**
	 * @typedef {Object} InputTimeProps
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

	/** @type {InputTimeProps & { [key: string]: any }} */
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
</script>

<input
	bind:value
	type="time"
	{min}
	{max}
	{step}
	{required}
	{disabled}
	{readonly}
	{name}
	{id}
	{autocomplete}
	{onchange}
	{onfocus}
	{onblur}
	{...rest}
/>
