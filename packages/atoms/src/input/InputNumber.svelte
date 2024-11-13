<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} value
	 */

	/** @type {Props & { [key: string]: any }} */
	let { value = $bindable(), ...rest } = $props()
</script>

<input bind:value type="number" {...rest} />
