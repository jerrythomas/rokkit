<script>
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import Slider from './Slider.svelte'
	import Icon from './Icon.svelte'
	import { dismissable, navigable } from '@rokkit/actions'

	import List from './List.svelte'
	// import ListItems from './ListItems.svelte'
	import Item from './Item.svelte'

	let className = ''
	export { className as class }
	export let name = null
	export let options = []
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = {}
	export let using = {}
	export let value = null
	export let placeholder = ''

	let activeIndex
	let open = false
	let offsetTop
	let icons = defaultStateIcons.selector
	let activeItem

	function handleSelect() {
		open = false
		dispatch('select', value)
		dispatch('change', value)
	}
	function handleNext() {
		if (!open) {
			open = true
		} else if (activeIndex < options.length - 1) {
			value = options[activeIndex + 1]
		}
	}
	function handlePrevious() {
		if (!open) {
			open = true
		} else if (activeIndex > 0) {
			value = options[activeIndex - 1]
		}
	}
	function handleKeySelect() {
		if (open) {
			if (value) {
				handleSelect()
			}
		}
	}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
	$: activeIndex = options.findIndex((item) => item === value)
	$: offsetTop = activeItem?.offsetTop + activeItem?.clientHeight ?? 0
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<input-select
	class="relative flex flex-col {className}"
	class:open
	tabindex="0"
	role="listbox"
	aria-label={name}
	use:dismissable
	use:navigable={{ horizontal: false, vertical: true }}
	on:focus={() => (open = true)}
	on:blur={() => (open = false)}
	on:dismiss={() => (open = false)}
	on:previous={handlePrevious}
	on:next={handleNext}
	on:select={handleKeySelect}
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<selected-item
		on:click|stopPropagation={() => (open = !open)}
		class="flex w-full items-center"
		bind:this={activeItem}
		role="option"
		tabindex="-1"
		aria-selected={value !== null && !open}
	>
		<slot>
			<item>
				<svelte:component this={using.default} value={value ?? placeholder} {fields} />
			</item>
		</slot>
		{#if open}
			<Icon name={icons.opened} label="opened" tabindex="-1" />
		{:else}
			<Icon name={icons.closed} label="closed" tabindex="-1" />
		{/if}
	</selected-item>
	{#if open}
		<Slider top={offsetTop}>
			<!-- <list class="flex flex-col w-full flex-shrink-0 select-none" role="listbox" tabindex="-1">
			<ListItems
				items={options}
				bind:value
				{fields}
				{using}
			/>
		</list> -->
			<List items={options} {fields} {using} bind:value on:select={handleSelect} tabindex="-1" />
		</Slider>
	{/if}
</input-select>
