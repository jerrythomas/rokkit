<script>
	import { inputTypes } from './types'

	export let data
	export let mapping = []
	export let using

	$: using = { ...inputTypes, ...using }
</script>

{#each mapping as { key, type, props }}
	{@const component = using[type]}

	{#if component}
		<svelte:component
			this={component}
			id={key}
			bind:value={data[key]}
			{...props}
			on:change
		/>
	{:else}
		<error>
			Unknown field type '{type}'. Add custom mapping with the 'using' property.
		</error>
	{/if}
{/each}
