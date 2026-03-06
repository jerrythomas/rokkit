<script lang="ts">
	import Toolbar from '../src/components/Toolbar.svelte'
	import type { ToolbarItem, ToolbarFields, ToolbarItemHandlers } from '../src/types/toolbar.js'

	const {
		items = [],
		fields,
		onclick,
		useItemSnippet = false
	}: {
		items?: ToolbarItem[]
		fields?: ToolbarFields
		onclick?: (value: unknown, item: ToolbarItem) => void
		useItemSnippet?: boolean
	} = $props()
</script>

{#if useItemSnippet}
	<Toolbar {items} {fields} {onclick}>
		{#snippet item(toolbarItem: ToolbarItem, _itemFields: ToolbarFields, handlers: ToolbarItemHandlers)}
			<button
				type="button"
				data-custom-toolbar-item
				data-item-value={toolbarItem.value}
				onclick={handlers.onclick}
				onkeydown={handlers.onkeydown}
			>
				Custom: {toolbarItem.label}
			</button>
		{/snippet}
	</Toolbar>
{:else}
	<Toolbar {items} {fields} {onclick} />
{/if}
