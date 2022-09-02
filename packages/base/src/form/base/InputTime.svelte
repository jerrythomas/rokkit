<script>
	/** @type {date} */
	export let value
</script>

<input bind:value type="time" {...$$restProps} on:change on:focus on:blur />
