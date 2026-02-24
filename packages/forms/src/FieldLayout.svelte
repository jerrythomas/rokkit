<script>
	import { getContext } from 'svelte'
	import { omit } from 'ramda'
	import InputField from './input/InputField.svelte'
	import FieldLayout from './FieldLayout.svelte'

	const registry = getContext('registry')

	let { value = $bindable({}), schema = {}, path = [], onchange } = $props()

	let Wrapper = registry.wrappers[schema.wrapper] ?? registry.wrappers.default
	let wrapperProps = omit(['wrapper', 'elements', 'key'], schema)
</script>

{#if !Array.isArray(schema.elements)}
	<error> Invalid schema. Expected schema to include an 'elements' array. </error>
{:else}
	<Wrapper {...wrapperProps}>
		{#each schema.elements as item, index (index)}
			{@const elementPath = item.key ? [...path, item.key] : path}
			{@const props = { ...item.props, path: elementPath }}
			{@const nested = Array.isArray(item.elements) && item.elements.length > 0}
			{@const Component = item.component
				? (registry.components[item.component] ?? registry.components.default)
				: null}

			{#if nested}
				{#if item.key}
					<FieldLayout {...props} schema={item} bind:value={value[item.key]} {onchange} />
				{:else}
					<FieldLayout {...props} schema={item} bind:value {onchange} />
				{/if}
			{:else if Component}
				<Component {...item.props} value={item.key ? value[item.key] : null} />
			{:else}
				{@const name = elementPath.join('.')}
				<InputField {name} bind:value={value[item.key]} {...item.props} {onchange} />
			{/if}
		{/each}
	</Wrapper>
{/if}
