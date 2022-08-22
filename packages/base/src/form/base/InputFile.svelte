<script>
	export let value
</script>

<input bind:value type="file" {...$$restProps} on:change on:focus on:blur />
