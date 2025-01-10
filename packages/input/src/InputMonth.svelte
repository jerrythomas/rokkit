<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} value
	 */

	/** @type {Props & { [key: string]: any }} */
	let { value = $bindable(), ...rest } = $props()
</script>

<input bind:value type="month" {...rest} />
