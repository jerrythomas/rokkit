<script>
	import { defaultFields, getComponent, hasChildren } from '@rokkit/core'
	import Item from './Item.svelte'

	export let value
	export let fields = {}
	export let using = {}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
	$: hasItems = hasChildren(value, fields)
	$: component = getComponent(value, fields, using)
</script>

<summary
	class="w-full flex flex-shrink-0 flex-row cursor-pointer items-center"
	tabindex="-1"
>
	<svelte:component this={component} bind:value {fields} />
	{#if hasItems}
		{#if value[fields.isOpen]}
			<icon class="accordion-opened sm" aria-label="collapse" />
		{:else}
			<icon class="accordion-closed sm" aria-label="expand" />
		{/if}
	{/if}
</summary>
