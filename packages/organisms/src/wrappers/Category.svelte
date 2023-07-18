<script>
	import { defaultFields } from '@rokkit/core'
	import { Tabs}  from '../Tabs.svelte'

	let className = ''
	export { className as class }
	export let items = []
	export let type = 'vertical'
	export let category
	export let fields = defaultFields
	export let using = {}
	export let navigator = 'tabs'

  $: component = using[navigator] ?? Tabs
</script>
<section class={className}>
	<svelte:component this={component} {items} {fields} {using} bind:value={category} {...$$restProps}/>
	<field-layout class={type}>
		<slot />
	</field-layout>
</section>