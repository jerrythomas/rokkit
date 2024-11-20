<script>
	import { createEmitter, defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import ListItems from './ListItems.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} [name]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [using]
	 * @property {any} [value]
	 * @property {number} [tabindex]
	 * @property {any} [hierarchy]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: className = 'list',
		name = 'list',
		items = [],
		fields = $bindable({}),
		using = $bindable({}),
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
	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
		using = { default: Item, ...using }
	})

	let filtered = $derived(items.filter((item) => !item[fields.isDeleted]))
</script>

<list
	class="flex flex-col w-full flex-shrink-0 select-none {className}"
	role="listbox"
	aria-label={name}
	use:navigator={{
		items,
		fields,
		enabled: hierarchy.length === 0,
		indices: cursor
	}}
	onmove={handleNav}
	onselect={handleNav}
	{tabindex}
>
	{@render children?.()}
	<ListItems items={filtered} {fields} {using} {value} {hierarchy} onchange />
</list>
