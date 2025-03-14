<script>
	import { getContext } from 'svelte'
	import { omit } from 'ramda'
	import InputField from './InputField.svelte'
	import FieldLayout from './FieldLayout.svelte'

	// const dispatch = createEventDispatcher()
	const registry = getContext('registry')

	export let value = {}
	export let schema = {}
	export let path = []

	function handle() {
		dispatch('change', value)
	}

	let Wrapper = registry.wrappers[schema.wrapper] ?? registry.wrappers.default
	let wrapperProps = omit(['wrapper', 'elements', 'key'], schema)
</script>

{#if !Array.isArray(schema.elements)}
	<error> Invalid schema. Expected schema to include an 'elements' array. </error>
{:else}
	<Wrapper {...wrapperProps}>
		{#each schema.elements as item}
			{@const elementPath = item.key ? [...path, item.key] : path}
			{@const props = { ...item.props, path: elementPath }}
			{@const nested = Array.isArray(item.elements) && item.elements.length > 0}
			{@const Component = item.component
				? (registry.components[item.component] ?? registry.components.default)
				: null}

			{#if nested}
				{#if item.key}
					<FieldLayout {...props} schema={item} bind:value={value[item.key]} on:change={handle} />
				{:else}
					<FieldLayout {...props} schema={item} bind:value on:change={handle} />
				{/if}
			{:else if Component}
				<Component {...item.props} value={item.key ? value[item.key] : null} />
			{:else}
				{@const name = elementPath.join('.')}
				<InputField {name} bind:value={value[item.key]} {...item.props} on:change={handle} />
			{/if}
		{/each}
	</Wrapper>
{/if}
