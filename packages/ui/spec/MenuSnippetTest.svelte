<script lang="ts">
	import Menu from '../src/components/Menu.svelte'
	import type { MenuItem, MenuFields, MenuItemHandlers } from '../src/types/menu.js'

	const {
		options = [],
		fields,
		useItemSnippet = false,
		useGroupLabelSnippet = false,
		useNamedSnippets = false,
		onselect
	}: {
		options?: MenuItem[]
		fields?: MenuFields
		useItemSnippet?: boolean
		useGroupLabelSnippet?: boolean
		useNamedSnippets?: boolean
		onselect?: (value: unknown, item: MenuItem) => void
	} = $props()
</script>

{#if useItemSnippet && useGroupLabelSnippet && useNamedSnippets}
	<Menu {options} {fields} {onselect}>
		{#snippet item(menuItem: MenuItem, _itemFields: MenuFields, handlers: MenuItemHandlers)}
			<button
				type="button"
				data-custom-item
				data-item-value={menuItem.value}
				onclick={handlers.onclick}
				onkeydown={handlers.onkeydown}
			>
				Custom: {menuItem.text}
			</button>
		{/snippet}
		{#snippet groupLabel(group: MenuItem, _groupFields: MenuFields)}
			<div data-custom-group-label>
				Group: {group.text}
			</div>
		{/snippet}
		{#snippet premium(menuItem: MenuItem, _itemFields: MenuFields, handlers: MenuItemHandlers)}
			<button
				type="button"
				data-premium-item
				data-item-value={menuItem.value}
				onclick={handlers.onclick}
				onkeydown={handlers.onkeydown}
			>
				🔒 Premium: {menuItem.text}
			</button>
		{/snippet}
		{#snippet special(menuItem: MenuItem, _itemFields: MenuFields, handlers: MenuItemHandlers)}
			<button
				type="button"
				data-special-item
				data-item-value={menuItem.value}
				onclick={handlers.onclick}
				onkeydown={handlers.onkeydown}
			>
				⭐ Special: {menuItem.text}
			</button>
		{/snippet}
	</Menu>
{:else if useItemSnippet && useGroupLabelSnippet}
	<Menu {options} {fields} {onselect}>
		{#snippet item(menuItem: MenuItem, _itemFields: MenuFields, handlers: MenuItemHandlers)}
			<button
				type="button"
				data-custom-item
				data-item-value={menuItem.value}
				onclick={handlers.onclick}
				onkeydown={handlers.onkeydown}
			>
				Custom: {menuItem.text}
			</button>
		{/snippet}
		{#snippet groupLabel(group: MenuItem, _groupFields: MenuFields)}
			<div data-custom-group-label>
				Group: {group.text}
			</div>
		{/snippet}
	</Menu>
{:else if useItemSnippet}
	<Menu {options} {fields} {onselect}>
		{#snippet item(menuItem: MenuItem, _itemFields: MenuFields, handlers: MenuItemHandlers)}
			<button
				type="button"
				data-custom-item
				data-item-value={menuItem.value}
				onclick={handlers.onclick}
				onkeydown={handlers.onkeydown}
			>
				Custom: {menuItem.text}
			</button>
		{/snippet}
	</Menu>
{:else if useGroupLabelSnippet}
	<Menu {options} {fields} {onselect}>
		{#snippet groupLabel(group: MenuItem, _groupFields: MenuFields)}
			<div data-custom-group-label>
				Group: {group.text}
			</div>
		{/snippet}
	</Menu>
{:else if useNamedSnippets}
	<Menu {options} {fields} {onselect}>
		{#snippet premium(menuItem: MenuItem, _itemFields: MenuFields, handlers: MenuItemHandlers)}
			<button
				type="button"
				data-premium-item
				data-item-value={menuItem.value}
				onclick={handlers.onclick}
				onkeydown={handlers.onkeydown}
			>
				🔒 Premium: {menuItem.text}
			</button>
		{/snippet}
		{#snippet special(menuItem: MenuItem, _itemFields: MenuFields, handlers: MenuItemHandlers)}
			<button
				type="button"
				data-special-item
				data-item-value={menuItem.value}
				onclick={handlers.onclick}
				onkeydown={handlers.onkeydown}
			>
				⭐ Special: {menuItem.text}
			</button>
		{/snippet}
	</Menu>
{:else}
	<Menu {options} {fields} {onselect} />
{/if}
