<script>
	/**
	 * @typedef {Object} InputTextAreaProps
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
	 * @property {number} rows
	 * @property {number} cols
	 * @property {number} maxlength
	 * @property {number} minlength
	 * @property {string} wrap
	 */

	/** @type {InputTextAreaProps & { [key: string]: any }} */
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
		rows,
		cols,
		maxlength,
		minlength,
		wrap,
		...rest
	} = $props()
</script>

<textarea
	bind:value
	{placeholder}
	{required}
	{disabled}
	{readonly}
	{name}
	{id}
	{rows}
	{cols}
	{maxlength}
	{minlength}
	{wrap}
	{onchange}
	{onfocus}
	{onblur}
	{...rest}
></textarea>
