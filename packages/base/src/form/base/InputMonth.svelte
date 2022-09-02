<script>
	/** @type {string} */
	export let value
</script>

<input bind:value type="month" {...$$restProps} on:change on:focus on:blur />
