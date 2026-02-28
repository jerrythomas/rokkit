<script lang="ts">
	import Menu from '../src/components/Menu.svelte'

	const {
		items = [],
		fields,
		onselect
	}: {
		items?: unknown[]
		fields?: Record<string, string>
		onselect?: (value: unknown, proxy: unknown) => void
	} = $props()
</script>

<Menu {items} {fields} {onselect}>
	{#snippet itemContent(proxy)}
		<span
			data-custom-item
			data-item-value={proxy.get('value')}
		>
			Custom: {proxy.text}
		</span>
	{/snippet}
	{#snippet groupContent(proxy)}
		<span data-custom-group>
			Group: {proxy.text}
		</span>
	{/snippet}
</Menu>
