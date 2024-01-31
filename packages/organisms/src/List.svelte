<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields, isObject } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'

	const dispatch = createEventDispatcher()

	let className = 'list'
	export { className as class }
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
	function equals(a, b) {
		if (Array.isArray(fields.id))
		   return fields.id.every((id) => isObject(a) && a[id] === b[id])
		if (isObject(a) && fields.id in a)
		   return a[fields.id] === b[fields.id]
	  return JSON.stringify(a) === JSON.stringify(b)
	}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
	$: filtered = items.filter((item) => !item[fields.isDeleted])
</script>

<list
	class="flex flex-col w-full flex-shrink-0 select-none {className}"
	role="listbox"
	use:navigator={{
		items,
		fields,
		enabled: hierarchy.length == 0,
		indices: cursor
	}}
	on:move={handleNav}
	on:select={handleNav}
	{tabindex}
>
	<slot />
	{#each filtered as item, index}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}
		{@const path = [...hierarchy, index].join(',')}
		{@const props = item[fields.props] || { fields }}
		<item
			class="item"
			role="option"
			aria-selected={equals(value,item)}
			data-path={path}
		>
			<svelte:component this={component} bind:value={item} {...props} on:change />
		</item>
	{/each}
</list>
