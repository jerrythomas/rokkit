<script>
	import { inputTypes } from '../types'

	export let data
	export let fields = []
	export let using

	$: using = { ...inputTypes, ...using }
</script>

{#each fields as { key, type, props }}
	{@const component = using[type]}
	{@const inputProps = { label: key, ...props }}

	{#if component}
		<svelte:component
			this={component}
			id={key}
			bind:value={data[key]}
			{...inputProps}
			on:change
		/>
	{:else}
		<error>
			Unknown field type '{type}'. Add custom fields with the 'using' property.
		</error>
	{/if}
{/each}
