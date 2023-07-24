<script>
	import { getContext } from 'svelte'
	import { defaultFields } from '@rokkit/core'

	const registry = getContext('registry')

	let className = ''
	export { className as class }
	export let options = []
	export let type = 'vertical'
	export let category = null
	export let fields = defaultFields
	export let navigator = 'tabs'

	$: component = $registry.navigators[navigator] ?? $registry.navigators.default
</script>

<section class={className}>
	<svelte:component
		this={component}
		{options}
		{fields}
		using={$registry}
		bind:value={category}
		{...$$restProps}
	/>
	<field-layout class={type}>
		<slot />
	</field-layout>
</section>
