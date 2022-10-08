<script>
	import { omit } from 'ramda'
	import FieldLayout from './FieldLayout.svelte'
	// let className = 'horizontal'
	// export { className as class }

	export let value
	export let using
	export let properties
	export let layout = 'horizontal'

	function getProps(properties, using) {
		let props = omit(['component'], properties)
		if (['object', 'array'].includes(properties.type))
			props = { ...props, using }
		return props
	}
</script>

<FieldLayout {layout}>
	{#each Object.entries(properties) as [key, properties]}
		{@const component = using[properties.component]}
		{@const props = getProps(properties, using)}

		<svelte:component this={component} bind:value={value[key]} {...props} />
	{/each}
</FieldLayout>
