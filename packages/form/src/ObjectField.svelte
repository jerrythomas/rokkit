<script>
	import { omit } from 'ramda'
	import FormField from './FormField.svelte'
	import FieldLayout from './FieldLayout.svelte'

	export let value
	export let schema
	export let using
</script>

<FieldLayout class={schema.layout}>
	{#each Object.entries(schema.properties) as [key, properties]}
		{@const component = using[properties.component]}
		{@const props = omit(['component'], properties)}
		{#if schema.type === 'object'}
			<svelte:self bind:value={value[key]} {using} {...props} />
		{:else}
			<FormField {component} bind:value={value[key]} {...props} />
		{/if}
	{/each}
</FieldLayout>
