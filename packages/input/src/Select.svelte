<script>
	import {
		Slider,
		Icon,
		List,
		Item,
		defaultFields,
		defaultStateIcons
	} from '@rokkit/core'
	import { dismissable, navigable } from '@rokkit/core/actions'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value = null
	export let placeholder = ''

	let activeIndex
	let open = false
	let offsetTop
	let icons = defaultStateIcons.selector

	function handleSelect() {
		open = false
		dispatch('select', value)
	}
	function handleNext() {
		if (!open) {
			open = true
		} else if (activeIndex < items.length - 1) {
			value = items[activeIndex + 1]
		}
	}
	function handlePrevious() {
		if (!open) {
			open = true
		} else if (activeIndex > 0) {
			value = items[activeIndex - 1]
		}
	}
	function handleKeySelect() {
		if (open) {
			if (value) {
				// value = items[activeIndex]
				handleSelect()
			}
		}
	}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
	$: activeIndex = items.findIndex((item) => item === value)
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<input-select
	class="flex flex-col relative {className}"
	class:open
	tabindex="0"
	use:dismissable
	use:navigable={{ horizontal: false, vertical: true }}
	on:blur={() => (open = false)}
	on:dismiss={() => (open = false)}
	on:previous={handlePrevious}
	on:next={handleNext}
	on:select={handleKeySelect}
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<selected-item
		on:click|stopPropagation={() => (open = !open)}
		class="w-full flex items-center"
		bind:clientHeight={offsetTop}
		role="option"
		tabindex="-1"
		aria-selected={value !== null && !open}
	>
		<slot>
			<item class="w-full flex">
				<svelte:component
					this={using.default}
					value={value ?? placeholder}
					{fields}
				/>
			</item>
		</slot>
		{#if open}
			<Icon name={icons.opened} label="opened" role="button" tabindex="-1" />
		{:else}
			<Icon name={icons.closed} label="closed" role="button" tabindex="-1" />
		{/if}
	</selected-item>
	{#if open}
		<Slider top={offsetTop}>
			<List
				{items}
				{fields}
				{using}
				bind:value
				on:select={handleSelect}
				tabindex="-1"
			/>
		</Slider>
	{/if}
</input-select>
