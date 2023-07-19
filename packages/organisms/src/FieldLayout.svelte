<script>
	import { componentTypes } from './types'
	import { omit } from 'ramda'
	import Wrapper from './wrappers/Wrapper.svelte'

	export let value = {}
	export let schema = {}
	export let path = []
	export let using = {}

	$: using = {...componentTypes, ...using}
	$: wrapper = using[schema.wrapper] ?? Wrapper
	$: wrapperProps = omit(['wrapper', 'elements', 'key'], schema)
</script>

{#if !Array.isArray(schema.elements)}
	<error>
		Invalid schema. Expected schema to include an 'elements' array.
	</error>
{:else}
	<svelte:component this={wrapper} {...wrapperProps} {using} >
		{#each schema.elements as item}
			{@const component = using[item.component]}
			{@const elementPath = item.key? [...path, item.key]: path}
			{@const props = {  ...item.props, path: elementPath}}
			{@const nested = Array.isArray(item.elements) && item.elements.length > 0}

			{#if nested }
			  {#if item.key}
				  <svelte:self {...props} {using} schema={item} bind:value={value[item.key]} on:change />
				{:else}
				  <svelte:self {...props} {using} schema={item} bind:value={value}  on:change />
				{/if}
			{:else if component}
				{@const name = elementPath.join('.')}
				<svelte:component
					this={component}
					{name}
					bind:value={value[item.key]}
					{...item.props}
					{using}
					on:change
				/>
			{:else}
				<error>
					Unknown component "{item.component}" for path "{elementPath.join('/')}".
					Add custom mapping with the "using" property.
				</error>
			{/if}
		{/each}
		</svelte:component>
{/if}

