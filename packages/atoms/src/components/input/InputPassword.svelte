<script>
	export let value
</script>

<input bind:value type="password" {...$$restProps} on:change on:focus on:blur />
