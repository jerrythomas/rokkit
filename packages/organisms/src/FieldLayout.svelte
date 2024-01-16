<script>
	import { getContext } from 'svelte'
	import { omit } from 'ramda'
	import InputField from './InputField.svelte'

	const registry = getContext('registry')

	export let value = {}
	export let schema = {}
	export let path = []

	$: wrapper = $registry.wrappers[schema.wrapper] ?? $registry.wrappers.default
	$: wrapperProps = omit(['wrapper', 'elements', 'key'], schema)
</script>

{#if !Array.isArray(schema.elements)}
	<error> Invalid schema. Expected schema to include an 'elements' array. </error>
{:else}
	<svelte:component this={wrapper} {...wrapperProps}>
		{#each schema.elements as item}
			{@const elementPath = item.key ? [...path, item.key] : path}
			{@const props = { ...item.props, path: elementPath }}
			{@const nested = Array.isArray(item.elements) && item.elements.length > 0}
			{@const component = item.component
				? $registry.components[item.component] ?? $registry.components.default
				: null}

			{#if nested}
				{#if item.key}
					<svelte:self {...props} schema={item} bind:value={value[item.key]} on:change />
				{:else}
					<svelte:self {...props} schema={item} bind:value on:change />
				{/if}
			{:else if component}
				<svelte:component
					this={component}
					{...item.props}
					value={item.key ? value[item.key] : null}
				/>
			{:else}
				{@const name = elementPath.join('.')}
				<InputField {name} bind:value={value[item.key]} {...item.props} on:change />
			{/if}
		{/each}
	</svelte:component>
{/if}
