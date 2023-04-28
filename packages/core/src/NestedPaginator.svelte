<script>
	import BreadCrumbs from './BreadCrumbs.svelte'
	import { Text } from './items'
	import { flattenNestedList } from './lib/nested'
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
			index = items.findIndex(
				(item, i) => i < index && item[fields.level] === level - 1
			)
			level = items[index][fields.level]
		}
		return trail
	}

	$: flatList = flattenNestedList(items, fields)
	$: fields = { ...defaultFields, ...(fields ?? {}) }
	$: using = { default: Text, ...(using ?? {}) }
</script>

<pages>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<icon
		class="arrow-left cursor-pointer"
		on:click={() => handleNav('previous')}
	/>
	<BreadCrumbs items={trail} {fields} {using} />
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<icon class="arrow-right cursor-pointer" on:click={() => handleNav('next')} />
</pages>
