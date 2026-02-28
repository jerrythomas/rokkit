<script>
	/**
	 * @typedef {Object} InputRangeProps
	 * @property {number} value
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 * @property {number} min
	 * @property {number} max
	 * @property {number} step
	 * @property {string} list
	 * @property {boolean} required
	 * @property {boolean} disabled
	 * @property {string} name
	 * @property {string} id
	 */

	/** @type {InputRangeProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		min = undefined,
		max = undefined,
		step = undefined,
		list = undefined,
		required,
		disabled,
		name,
		id,
		onchange,
		onfocus,
		onblur,
		...rest
	} = $props()

	function handleChange(event) {
		value = event.target.valueAsNumber
		onchange?.(value)
	}
</script>

<input
	bind:value
	type="range"
	{min}
	{max}
	{step}
	{list}
	{required}
	{disabled}
	{name}
	{id}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
