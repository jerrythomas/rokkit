<script>
	import { navigable } from './actions'
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import { Text } from './items'

	const dispatch = createEventDispatcher()

	let className = 'list'
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value = null
	export let navigate = true
	export let tabindex = 0
	export let activeIndex
	export let parentIndices = []

	function handleClick(item, index) {
		value = item
		dispatch('select', { item, indices: [...parentIndices, index] })
	}

	function movePrevious() {
		if (activeIndex > 0) activeIndex = activeIndex - 1
	}
	function moveNext() {
		if (activeIndex < items.length - 1) activeIndex = activeIndex + 1
		alert(activeIndex)
	}
	function handleSelect() {
		if (activeIndex > -1) handleClick(items[activeIndex])
	}

	$: activeIndex = items.findIndex((x) => x == value)
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: filtered = items.filter((item) => !item[fields.isDeleted])
</script>

<list
	class="flex flex-col w-full flex-shrink-0 select-none {className}"
	role="listbox"
	use:navigable={{ horizontal: false, vertical: true, enabled: navigate }}
	on:previous={movePrevious}
	on:next={moveNext}
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
