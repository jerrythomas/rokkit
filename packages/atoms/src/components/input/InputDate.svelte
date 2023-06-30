<script>
	/** @type {date} */
	export let value
</script>

<input bind:value type="date" {...$$restProps} on:change on:focus on:blur />
