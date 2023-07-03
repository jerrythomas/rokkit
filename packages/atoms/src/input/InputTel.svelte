<script>
	/** @type {string} */
	export let value
</script>

<input bind:value type="url" {...$$restProps} on:change on:focus on:blur />
