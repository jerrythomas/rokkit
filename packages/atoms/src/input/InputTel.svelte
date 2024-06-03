<script>
	/** @type {string} */
	export let value
</script>

<input bind:value type="tel" {...$$restProps} on:change on:focus on:blur />
