<script>
	export let value
</script>

<input bind:value type="number" {...$$restProps} on:change on:focus on:blur />
