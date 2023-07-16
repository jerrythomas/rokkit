<script>
	import { componentTypes } from './types'
	let className = ''

	export { className as class }
	export let value
	export let schema = {}
	export let path = []
	export let using = componentTypes

	$: group = schema.label || schema.group
</script>

<field-layout class="{schema.type ?? 'vertical'} {className}" class:group>
	{#if schema.label}
		<legend>{schema.label}</legend>
	{/if}
	{#if Array.isArray(schema.elements)}
	{#each schema.elements as item}
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
	{/if}
</field-layout>
