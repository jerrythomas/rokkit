<script>
	import {
		Slider,
		Icon,
		List,
		Text,
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
	export let value
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
	$: using = { default: Text, ...using }
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
	<slot />
	<button
		on:click|stopPropagation={() => (open = !open)}
		class="flex w-full"
		bind:clientHeight={offsetTop}
		tabindex="-1"
	>
		<svelte:component
			this={using.default}
			content={value ?? placeholder}
			{fields}
		/>
		{#if open}
			<Icon name={icons.opened} />
		{:else}
			<Icon name={icons.closed} />
		{/if}
	</button>
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
