<script>
	import { defaultFields, flattenNestedList } from '@rokkit/core'
	import Item from './Item.svelte'
	import BreadCrumbs from './BreadCrumbs.svelte'
	import Icon from './Icon.svelte'
	// import { flattenNestedList } from './lib/nested'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
	export let items
	export let value
	export let fields
	export let using

	let trail
	let flatList

	function handleNav(event) {
		let current = flatList.findIndex((item) => item === value)
		let index = current
		if (event === 'previous') {
			while (index > 0 && !flatList[index][fields.key]) {
				index = index - 1
			}
		} else {
			while (index < flatList.length - 1 && !flatList[index][fields.key]) {
				index = index + 1
			}
		}
		if (flatList[index][fields.key]) {
			value = flatList[index]
			trail = findTrail(flatList, value)
			dispatch('change', { item: value, trail })
		}
	}
	function findTrail(items, value) {
		let trail = []
		let index = items.findIndex((item) => item === value)
		if (index === -1) return trail

		let level = items[index][fields.level]
		while (level > 0) {
			trail.unshift(items[index])
			index = items.findIndex((item, i) => i < index && item[fields.level] === level - 1)
			level = items[index][fields.level]
		}
		return trail
	}

	$: flatList = flattenNestedList(items, fields)
	$: fields = { ...defaultFields, ...(fields ?? {}) }
</script>

<pages>
	<Icon
		name="arrow-left"
		class="cursor-pointer"
		label="Previous"
		onclick={() => handleNav('previous')}
	/>
	<BreadCrumbs items={trail} {fields} {using} />
	<Icon name="arrow-right" class="cursor-pointer" onclick={() => handleNav('next')} label="Next" />
</pages>
