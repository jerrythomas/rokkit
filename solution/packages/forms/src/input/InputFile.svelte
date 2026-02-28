<script>
	/**
	 * @typedef {Object} InputFileProps
	 * @property {FileList} value
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 * @property {string} accept
	 * @property {boolean} multiple
	 * @property {boolean} required
	 * @property {boolean} disabled
	 * @property {string} name
	 * @property {string} id
	 */

	/** @type {InputFileProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		accept,
		multiple,
		required,
		disabled,
		name,
		id,
		...rest
	} = $props()

	function handleChange(event) {
		value = event.target.files
		onchange?.(value)
	}
</script>

<input
	type="file"
	{accept}
	{multiple}
	{required}
	{disabled}
	{name}
	{id}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
