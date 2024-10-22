<script>
	import FieldLayout from './FieldLayout.svelte';
	import { getContext, createEventDispatcher } from 'svelte'
	import { omit } from 'ramda'
	import InputField from './InputField.svelte'

	const dispatch = createEventDispatcher()
	const registry = getContext('registry')

	let { value = $bindable({}), schema = {}, path = [] } = $props();

	function handle() {
		dispatch('change', value)
	}

	let wrapper = $derived($registry.wrappers[schema.wrapper] ?? $registry.wrappers.default)
	let wrapperProps = $derived(omit(['wrapper', 'elements', 'key'], schema))
</script>

{#if !Array.isArray(schema.elements)}
	<error> Invalid schema. Expected schema to include an 'elements' array. </error>
{:else}
	{@const SvelteComponent_1 = wrapper}
	<SvelteComponent_1 {...wrapperProps}>
		{#each schema.elements as item}
			{@const elementPath = item.key ? [...path, item.key] : path}
			{@const props = { ...item.props, path: elementPath }}
			{@const nested = Array.isArray(item.elements) && item.elements.length > 0}
			{@const component = item.component
				? $registry.components[item.component] ?? $registry.components.default
				: null}

			{#if nested}
				{#if item.key}
					<FieldLayout {...props} schema={item} bind:value={value[item.key]} on:change={handle} />
				{:else}
					<FieldLayout {...props} schema={item} bind:value on:change={handle} />
				{/if}
			{:else if component}
				{@const SvelteComponent = component}
				<SvelteComponent
					{...item.props}
					value={item.key ? value[item.key] : null}
				/>
			{:else}
				{@const name = elementPath.join('.')}
				<InputField {name} bind:value={value[item.key]} {...item.props} on:change={handle} />
			{/if}
		{/each}
	</SvelteComponent_1>
{/if}
