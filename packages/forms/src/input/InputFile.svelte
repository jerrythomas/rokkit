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
</script>

<input
	bind:value
	type="file"
	{accept}
	{multiple}
	{required}
	{disabled}
	{name}
	{id}
	{onchange}
	{onfocus}
	{onblur}
	{...rest}
/>
