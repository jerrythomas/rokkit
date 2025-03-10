<script module>
	import { getKeyFromPath } from '@rokkit/core'
	import { noop } from '@rokkit/core'
	import { equals } from 'ramda'
	export { listItems }
</script>

{#snippet listItems(items, mapping, value, hierarchy = [], onchange = noop)}
	{#each items as item, index}
		{@const Template = mapping.getComponent(item)}
		{@const path = getKeyFromPath([...hierarchy, index])}
		{@const props = mapping.getAttribute(item, 'props') || {}}
		<rk-list-item
			role="option"
			data-path={path}
			aria-selected={equals(value, item)}
			aria-current={equals(value, item)}
		>
			<Template bind:value={items[index]} {mapping} {onchange} {...props} />
		</rk-list-item>
	{/each}
{/snippet}
