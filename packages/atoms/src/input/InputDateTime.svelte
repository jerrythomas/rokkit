<script>
	/**
	 * @typedef {Object} Props
	 * @property {date} value
	 */

	/** @type {Props & { [key: string]: any }} */
	let { value = $bindable(), ...rest } = $props()
</script>

<input bind:value type="datetime-local" {...rest} />
