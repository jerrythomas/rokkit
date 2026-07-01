<script lang="ts">
	import { List, ItemSwitch, ItemToggle } from '@rokkit/ui'
	import type { ProxyItem } from '@rokkit/states'

	// Two shapes co-exist in the same list — binary switches and a toggle-group
	// row. Both go through the standard `itemContent` snippet + `onselect` flow
	// so behaviour stays consistent with the rest of the List surface.
	const settings = $state<Array<Record<string, unknown>>>([
		{ label: 'Notifications', description: 'Alerts & sounds', checked: true },
		{ label: 'Dark mode', description: 'Theme preference', checked: false },
		{ label: 'Sync over cellular', description: 'Data usage', checked: false },
		{ label: 'Density', value: 'md', options: ['sm', 'md', 'lg'] }
	])

	function handleSelect(_: unknown, proxy: ProxyItem) {
		const item = proxy.value as Record<string, unknown>
		if ('checked' in item) item.checked = !item.checked
	}

	function handleToggle(next: unknown, _opt: unknown, proxy: ProxyItem) {
		const item = proxy.value as Record<string, unknown>
		item.value = next
	}
</script>

<List items={settings} onselect={handleSelect}>
	{#snippet itemContent(proxy)}
		{#if proxy.get('options')}
			<ItemToggle {proxy} onchange={handleToggle} />
		{:else}
			<ItemSwitch {proxy} />
		{/if}
	{/snippet}
</List>
