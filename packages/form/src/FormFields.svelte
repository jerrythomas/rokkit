<script>
	import { inputTypes } from './types'

	export let data
	export let mapping = []
	export let using

	$: using = { ...inputTypes, ...using }
</script>

<fields class="flex flex-col gap-2">
	{#each mapping as { key, type, props }}
		{@const component = using[type]}
		{@const properties = type === 'object' ? { using, ...props } : { ...props }}

		{#if component}
			<svelte:component
				this={component}
				name={key}
				bind:value={data[key]}
				{...properties}
				on:change
			/>
		{:else}
			<error>
				Unknown field type '{type}'. Add custom mapping with the 'using'
				property.
			</error>
		{/if}
	{/each}
</fields>
