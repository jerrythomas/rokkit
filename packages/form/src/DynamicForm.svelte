<script>
	import NestedLayout from './NestedLayout.svelte'
	import { deriveLayout } from './layout'

	export let schema
	export let segments = deriveLayout(schema)
	export let data
	export let using
</script>

<form on:submit on:reset {...$$restProps}>
	{#each segments as { properties, layout }}
		<NestedLayout bind:value={data} {using} {properties} class={layout} />
	{/each}
</form>
