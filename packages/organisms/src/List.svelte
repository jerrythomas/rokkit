<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import ListItems from './ListItems.svelte'

	const dispatch = createEventDispatcher()

	let className = 'list'
	export { className as class }
	export let name = 'list'
	export let items = []
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = {}
	export let using = {}
	export let value = null
	export let tabindex = 0
	export let hierarchy = []
	let cursor = []

	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		dispatch('select', { item: value, indices: cursor })
	}
	// function equals(a, b) {
	// 	if (Array.isArray(fields.id)) return fields.id.every((id) => isObject(a) && a[id] === b[id])
	// 	if (isObject(a) && fields.id in a) return a[fields.id] === b[fields.id]
	// 	return JSON.stringify(a) === JSON.stringify(b)
	// }

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
	$: filtered = items.filter((item) => !item[fields.isDeleted])
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
	on:move={handleNav}
	on:select={handleNav}
	{tabindex}
>
	<slot />
	<ListItems items={filtered} {fields} {using} {value} {hierarchy} on:change />
</list>
