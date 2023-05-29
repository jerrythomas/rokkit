<script>
	import { defaultFields } from '../constants'
	import Item from './Item.svelte'

	export let value
	export let fields = {}
	export let using = {}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
	$: hasItems = value[fields.children] && value[fields.children].length > 0
	$: component = using[value[fields.component] ?? 'default']
</script>

<summary
	class="w-full flex flex-shrink-0 flex-row cursor-pointer items-center"
	tabindex="-1"
>
	<svelte:component this={component} bind:value {fields} />
	{#if hasItems}
		{#if value[fields.isOpen]}
			<icon class="accordion-opened sm" aria-label="expand" />
		{:else}
			<icon class="accordion-closed sm" aria-label="collapse" />
		{/if}
	{/if}
</summary>
