<script>
	import { createEmitter, FieldMapper } from '@rokkit/core'
	import { Item } from '@rokkit/atoms'
	import { ListItems } from '@rokkit/ui'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} [name]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {any} [value]
	 * @property {number} [tabindex]
	 * @property {any} [hierarchy]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: className = 'list',
		name = 'list',
		items = $bindable([]),
		mapping = new FieldMapper({}, { default: Item }),
		value = $bindable(null),
		tabindex = 0,
		hierarchy = [],
		children,
		...events
	} = $props()
	let cursor = $state([])

	let emitter = createEmitter(events, ['select'])
	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path
		emitter.select({ item: value, indices: cursor })
	}

	// setContext('data', items)
	// let filtered = $derived(items.filter((item) => !item[fields.isDeleted]))
</script>

<rk-list
	class="flex w-full flex-shrink-0 select-none flex-col {className}"
	role="listbox"
	aria-label={name}
	onmove={handleNav}
	onselect={handleNav}
	{tabindex}
>
	{@render children?.()}
	<ListItems bind:items {mapping} {hierarchy} />
</rk-list>
