<script>
	export let value
</script>

<input bind:value type="color" {...$$restProps} on:change on:focus on:blur />
