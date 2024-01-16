<script>
	export let value
</script>

<input type="checkbox" {...$$restProps} bind:checked={value} on:change on:focus on:blur />
