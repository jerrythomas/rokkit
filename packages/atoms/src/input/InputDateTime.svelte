<script>
	/** @type {date} */
	export let value
</script>

<input bind:value type="datetime-local" {...$$restProps} on:change on:focus on:blur />
