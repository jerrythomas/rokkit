<script>
	import { navigator } from './actions'
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import { Text } from './items'
	import { updateCursor } from './list'

	const dispatch = createEventDispatcher()

	let className = 'list'
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value = null
	export let tabindex = 0
	export let activeIndex
	export let hierarchy = []
	let active
	let cursor = []
	function handleClick(item, index) {
		cursor = [index]
		value = item
		dispatch('select', { item, indices: [...hierarchy, index] })
	}

	function handleMove(event) {
		active = event.node
		cursor = event.indices
	}

	function handleSelect(event) {
		value = event.node
		active = event.node
		cursor = event.indices
		dispatch('select', { item: value, indices: [...hierarchy, ...cursor] })
	}

	$: updateCursor(cursor, value, items)
	// $: activeIndex = items.findIndex((x) => x == value)
	$: active = value
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: filtered = items.filter((item) => !item[fields.isDeleted])
</script>

<list
	class="flex flex-col w-full flex-shrink-0 select-none {className}"
	role="listbox"
	use:navigator={{
		items,
		fields,
		enabled: hierarchy.length > 0,
		indices: cursor
	}}
	on:move={handleMove}
	on:select={handleSelect}
	{tabindex}
>
	<slot />
	{#each filtered as item, index}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<item
			class="flex flex-shrink-0 flex-grow-0 min-h-8 items-center cursor-pointer w-full gap-2 select-none item"
			role="option"
			aria-selected={value === item}
			class:is-selected={value === item}
			class:is-active={activeIndex === index}
			on:click={() => handleClick(item, index)}
		>
			<svelte:component
				this={component}
				bind:content={item}
				{fields}
				on:change
			/>
		</item>
	{/each}
</list>
