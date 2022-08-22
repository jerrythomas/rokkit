<script>
	export let value
</script>

<input bind:value type="text" {...$$restProps} on:change on:focus on:blur />
