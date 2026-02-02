<script>
	import { has } from 'ramda'
	import { createEmitter, defaultFields, hasChildren } from '@rokkit/core'
	import { NestedController, messages } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import Summary from './Summary.svelte'
	import ListBody from './ListBody.svelte'

	const eventNames = ['collapse', 'change', 'expand', 'click', 'select', 'move', 'toggle']
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapper} [fields]
	 * @property {boolean} [autoCloseSiblings]
	 * @property {boolean} [multiselect]
	 * @property {any} [value]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		items = $bindable([]),
		value = $bindable(null),
		fields = {},
		autoCloseSiblings = false,
		multiselect = false,
		empty,
		oncollapse,
		onexpand,
		onchange,
		onselect,
		onmove,
		ontoggle,
		...snippets
	} = $props()

	let selected = $state([])

	let emitter = $derived(
		createEmitter({ oncollapse, onexpand, onchange, onselect, onmove, ontoggle }, eventNames)
	)

	// Note: fields, multiselect, autoCloseSiblings are captured at initialization
	// and won't update reactively - this is intentional for controller configuration
	let wrapper = new NestedController(items, value, fields, {
		multiselect,
		autoCloseSiblings
	})

	let derivedFields = $derived({ ...defaultFields, ...fields })

	function handleAction(event) {
		const { name, data } = event.detail

		if (name === 'select') value = data.value
		if (name === 'toggle') {
			// Toggle expansion is handled by the wrapper
		}
		if (has(name, emitter)) {
			selected = data.selected
			emitter[name](data)
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	data-accordion-root
	class={classes}
	tabindex="0"
	use:navigator={{ wrapper, nested: true }}
	onaction={handleAction}
>
	{#if items.length === 0}
		<div data-accordion-empty role="presentation">
			{#if empty}
				{@render empty()}
			{:else}
				{messages.current.emptyList}
			{/if}
		</div>
	{/if}
	{#each items as item, index (index)}
		{@const key = `${index}`}
		{@const expanded = item[derivedFields.expanded]}
		{@const itemHasChildren = hasChildren(item, derivedFields)}
		<div
			data-accordion-item
			class:is-expanded={expanded}
			class:is-selected={wrapper.selectedKeys.has(key)}
			data-expanded={expanded}
			data-disabled={item[derivedFields.disabled] ?? false}
			aria-expanded={itemHasChildren ? expanded : undefined}
			aria-disabled={item[derivedFields.disabled] ?? false}
		>
			<Summary value={item} {fields} {expanded} hasChildren={itemHasChildren} path={key} />
			{#if expanded && itemHasChildren}
				<div data-accordion-content role="region">
					<ListBody
						bind:items={item[derivedFields.children]}
						bind:value
						fields={fields.fields ?? fields}
						selectedKeys={wrapper.selectedKeys}
						focusedKey={wrapper.focusedKey}
						onchange={emitter.change}
						{snippets}
					/>
				</div>
			{/if}
		</div>
	{/each}
</div>
