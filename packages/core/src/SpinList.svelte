<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import { Text } from './items'
	import { navigable } from './actions'
	import { getComponent } from './list'

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

	$: using = { default: Text, ...using }
	$: fields = { ...defaultFields, ...fields }
	$: value = index >= 0 ? items[index] : null
	$: component = getComponent(value, fields)
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
	<!-- <svelte:component this={component} bind:content={value} {fields} on:change /> -->
	<square class="h-full position-absolute right-0">
		<icon class="i-carbon-chevron-sort" />
	</square>
</spin-list>
