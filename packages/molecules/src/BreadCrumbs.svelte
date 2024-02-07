<script>
	import { defaultFields, getComponent } from '@rokkit/core'
	import Item from './Item.svelte'

	export let items = []
	export let separator = '/'
	export let fields = defaultFields
	export let using = { default: Item }

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
</script>

<crumbs class="flex">
	{#each items as item, index}
		{@const component = getComponent(item, fields, using)}
		{#if index > 0}
			<span>
				{#if separator.length == 1}
					{separator}
				{:else}
					<icon class={separator} />
				{/if}
			</span>
		{/if}
		<crumb class:is-selected={index == items.length - 1}>
			<svelte:component this={component} value={item} {fields} />
		</crumb>
	{/each}
</crumbs>
