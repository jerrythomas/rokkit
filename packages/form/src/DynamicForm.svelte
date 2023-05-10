<script>
	import FieldLayout from './FieldLayout.svelte'
	import { deriveLayout } from './layout'

	export let schema
	export let segments = deriveLayout(schema)
	export let data
	export let using
</script>

<form on:submit on:reset {...$$restProps}>
	{#each segments as { properties, layout }}
		<FieldLayout bind:value={data} {using} {properties} {layout} />
	{/each}
</form>
