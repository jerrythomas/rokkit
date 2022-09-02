<script>
	/** @type {string} */
	export let value
</script>

<input bind:value type="email" {...$$restProps} on:change on:focus on:blur />
