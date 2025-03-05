<script module>
	import { noop } from '@rokkit/core'
	import { equals } from 'ramda'
	export { listItems }
</script>

{#snippet listItems(items, mapping, value, hierarchy = [], onchange = noop)}
	{#each items as item, index}
		{@const Template = mapping.getComponent(item)}
		{@const path = [...hierarchy, index].join(',')}
		{@const props = mapping.getAttribute(item, 'props') || {}}
		<rk-list-item role="option" aria-selected={equals(value, item)} data-path={path}>
			<Template bind:value={items[index]} {mapping} {onchange} {...props} />
		</rk-list-item>
	{/each}
{/snippet}
