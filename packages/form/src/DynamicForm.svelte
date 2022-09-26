<script>
	import NestedLayout from './NestedLayout.svelte'

	export let schema
	export let segments = [schema]
	export let data
	export let using
</script>

<form on:submit on:reset {...$$restProps}>
	{#each segments as { properties, layout }}
		<NestedLayout bind:value={data} {using} {properties} class={layout} />
	{/each}
</form>
