<script lang="ts">
	import { getContext, type Component } from 'svelte'
	import { omit } from 'ramda'
	import InputField from './InputField.svelte'
	import FieldLayout from './FieldLayout.svelte'

	type Registry = {
		wrappers: Record<string, Component<Record<string, unknown>>>
		components: Record<string, Component<Record<string, unknown>>>
	}

	type LayoutSchema = {
		wrapper?: string
		key?: string
		component?: string
		elements?: LayoutSchema[]
		props?: Record<string, unknown>
		[key: string]: unknown
	}

	/** Recursive field-value tree: each node is itself an indexable record of nodes. */
	type FieldTree = { [key: string]: FieldTree }

	type Props = {
		value?: FieldTree
		schema?: LayoutSchema
		path?: string[]
		onchange?: (value: unknown) => void
	}

	const registry = getContext<Registry>('registry')

	let { value = $bindable({}), schema = {}, path = [], onchange }: Props = $props()

	let Wrapper = registry.wrappers[schema.wrapper ?? ''] ?? registry.wrappers.default
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
				{#if item.key}
					<InputField {name} bind:value={value[item.key]} {...item.props} {onchange} />
				{:else}
					<InputField {name} {...item.props} {onchange} />
				{/if}
			{/if}
		{/each}
	</Wrapper>
{/if}
