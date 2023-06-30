<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from 'rokkit/utils'
	import { Item } from '@rokkit/molecules'
	import { navigable } from 'rokkit/actions'
	// import { getComponent } from './list'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value
	let index = -1

	function moveNext() {
		index = index < items.length - 1 ? index + 1 : 0
		dispatch('select', items[index])
	}
	function moveBack() {
		index = index > 0 ? index - 1 : items.length - 1
		dispatch('select', items[index])
	}

	$: using = { default: Item, ...using }
	$: fields = { ...defaultFields, ...fields }
	$: value = index >= 0 ? items[index] : null
	// $: component = getComponent(value, fields)
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<spin-list class="flex flex-row w-full {className}" tabindex={0}>
	<input
		type="text"
		class="flex flex-grow"
		bind:value
		readonly
		use:navigable
		on:next={moveNext}
		on:previous={moveBack}
	/>
	<!-- <svelte:component this={component} bind:value={value} {fields} on:change /> -->
	<square class="right-0 h-full position-absolute">
		<icon class="i-carbon-chevron-sort" />
	</square>
</spin-list>
