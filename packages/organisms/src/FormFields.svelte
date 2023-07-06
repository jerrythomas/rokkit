<script>
	import { inputTypes } from './types'

	let className = ''
	export { className as class }
	export let value
	export let schema = []
	export let using
	export let path = []

	$: using = { ...inputTypes, ...using }
</script>

<fields class="flex flex-col gap-2 {className}">
	{#each schema as { key, type, props }}
		{@const component = using[type]}

		{#if type === 'group'}
			<svelte:self
				bind:value={value[key]}
				{...props}
				{using}
				path={key ? [...path, key] : path}
				on:change
			/>
		{:else if component}
			<svelte:component
				this={component}
				name={[...path, key].join('.')}
				bind:value={value[key]}
				{...props}
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
