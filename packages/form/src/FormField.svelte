<script>
	export let value
	export let using
	export let component
	export let hasChanged

	function handleChange() {
		hasChanged = true
	}
</script>

<svelte:component
	this={using[component]}
	bind:value
	{...$$restProps}
	on:blur={handleChange}
/>
