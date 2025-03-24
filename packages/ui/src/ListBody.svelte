<script>
	import { getKeyFromPath, FieldMapper, getSnippet } from '@rokkit/core'
	import Item from './Item.svelte'
	import { equals } from 'ramda'

	let {
		items = $bindable([]),
		value = null,
		fields,
		selected = [],
		path = [],
		onchange = () => {},
		stub = null,
		extra
	} = $props()
	let fm = $derived.by(() => {
		return new FieldMapper(fields)
	})
</script>

{#each items as item, index}
	{@const template = getSnippet(extra, fm.get('snippet', item, stub))}
	{@const pathKey = getKeyFromPath([...path, index])}
	{@const props = fm.get('props', item) || {}}
	<rk-list-item
		role="option"
		data-path={pathKey}
		aria-selected={selected.includes(item)}
		aria-current={equals(item, value)}
	>
		<svelte:boundary>
			{#if template}
				{@render template(item, props, onchange)}
				{#snippet failed()}
					<Item value={item} {fields} />
				{/snippet}
			{:else}
				<Item value={item} {fields} />
			{/if}
		</svelte:boundary>
	</rk-list-item>
{/each}
