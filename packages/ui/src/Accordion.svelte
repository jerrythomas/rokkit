<script>
	import { equals } from 'ramda'
	import { createEmitter, noop, getKeyFromPath } from '@rokkit/core'
	import { NestedProxy } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import Summary from './Summary.svelte'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {boolean} [autoCloseSiblings]
	 * @property {boolean} [multiselect]
	 * @property {any} [value]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		items = $bindable([]),
		value = $bindable(null),
		fields,
		autoCloseSiblings = false,
		multiselect = false,
		header,
		footer,
		empty,
		...events
	} = $props()

	let emitter = $derived(
		createEmitter(events, ['collapse', 'change', 'expand', 'click', 'select', 'move'])
	)
	let wrapper = new NestedProxy(items, value, fields, { events, multiselect, autoCloseSiblings })
</script>

{#snippet listItems(nodes, onchange = noop)}
	{#each nodes as node, index}
		{@const template = getSnippet(extra, node.get('component'))}
		{@const path = getKeyFromPath(node.path)}
		{@const props = node.get('props') || {}}
		<rk-list-item
			role="option"
			data-path={path}
			aria-selected={node.selected}
			aria-current={node.focused}
		>
			{#if template}
				{@render template(node, props, onchange)}
			{:else}
				<Item value={node.value} fields={node.fields} />
			{/if}
		</rk-list-item>
	{/each}
{/snippet}
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-accordion
	class={classes}
	tabindex="0"
	use:navigator={{ wrapper }}
	onactivate={() => (value = wrapper.value)}
>
	{#if header}
		<rk-header>{@render header()}</rk-header>
	{/if}
	{#if wrapper.nodes.length === 0}
		<rk-list-item role="presentation">
			{#if empty}
				{@render empty()}
			{:else}
				No items found.
			{/if}
		</rk-list-item>
	{/if}
	{#each wrapper.nodes as node, index}
		<div
			class="flex flex-col"
			class:is-expanded={node.expanded}
			class:is-selected={node.selected}
			data-path={index}
		>
			<Summary
				bind:value={wrapper.nodes[index].value}
				fields={node.fields}
				expanded={node.expanded}
				hasChildren={node.hasChildren()}
			/>
			{#if node.expanded}
				<rk-list role="listbox" tabindex="-1">
					{@render listItems(node.children, events.change)}
				</rk-list>
			{/if}
		</div>
	{/each}
	{#if footer}
		<rk-footer>{@render footer()}</rk-footer>
	{/if}
</rk-accordion>
