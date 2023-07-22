<script>
	export let value
</script>

<input
	hidden
	type="checkbox"
	{...$$restProps}
	bind:checked={value}
	on:change
	on:focus
	on:blur
/>
