<script>
	import { componentTypes } from './types'

	let className = 'flex flex-col gap-2'
	export { className as class }
	export let value
	export let schema = []
	export let using = {}
	export let path = []

	$: using = { ...componentTypes, ...using }
</script>

<field-group class={className}>
	{#each schema as item}
		{@const component = using[item.component]}
		{@const props = item.props || {}}

		{#if item.group}
			<svelte:self
				bind:value={value[item.key]}
				{...props}
				{using}
				path={item.key ? [...path, item.key] : path}
				on:change
			/>
		{:else if component}
			{@const name = [...path, item.key].join('.')}
			<svelte:component
				this={component}
				{name}
				bind:value={value[item.key]}
				{...props}
				on:change
			/>
		{:else}
			<error>
				Unknown component '{item.component}'. Add custom mapping with the
				'using' property.
			</error>
		{/if}
	{/each}
</field-group>
