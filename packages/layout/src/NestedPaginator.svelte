<script>
	import { run } from 'svelte/legacy'

	import { defaultFields, flattenNestedList } from '@rokkit/core'
	import { Item, BreadCrumbs } from '@rokkit/molecules'
	// import { flattenNestedList } from './lib/nested'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
	let { items, value = $bindable(), fields = $bindable(), using = $bindable() } = $props()

	let trail = $state()
	let flatList = $state()

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

	run(() => {
		flatList = flattenNestedList(items, fields)
	})
	run(() => {
		fields = { ...defaultFields, ...(fields ?? {}) }
	})
	run(() => {
		using = { default: Item, ...(using ?? {}) }
	})
</script>

<pages>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<icon class="arrow-left cursor-pointer" onclick={() => handleNav('previous')}></icon>
	<BreadCrumbs items={trail} {fields} {using} />
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<icon class="arrow-right cursor-pointer" onclick={() => handleNav('next')}></icon>
</pages>
