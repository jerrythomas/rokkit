<script>
	import { createEventDispatcher } from 'svelte'
	import { dismissable } from '@rokkit/actions'
	import { defaultFields, defaultStateIcons } from '@rokkit/core'

	import { Icon, Slider } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'
	import List from './List.svelte'
	// import Slider from './Slider.svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = defaultFields
	export let using = { default: Item }
	export let value = null
	export let title = null
	export let icon = null
	export let small = false

	$: using = { default: Item, ...using }
	$: fields = { ...defaultFields, ...fields }

	let offsetTop = 0
	let open = false
	let icons = defaultStateIcons.selector

	function handleSelect(event) {
		open = false
		dispatch('change', event.detail)
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<drop-down
	class="flex relative cursor-pointer select-none dropdown {className}"
	class:open
	tabindex="0"
	aria-haspopup="true"
	aria-controls="menu"
	use:dismissable
	on:blur={() => (open = false)}
	on:dismiss={() => (open = false)}
>
	<button
		on:click|stopPropagation={() => (open = !open)}
		class="flex items-center"
		bind:clientHeight={offsetTop}
		tabindex="-1"
	>
		{#if icon}
			<Icon name={icon} />
		{/if}
		{#if !small && title}
			<p class="w-full flex">{title}</p>
		{/if}
		{#if open}
			<icon class={icons.opened} />
		{:else}
			<icon class={icons.closed} />
		{/if}
	</button>
	{#if open}
		<!-- <div
			class="absolute z-10 menu h-fit w-full flex flex-col"
			style:top="{offsetTop}px"
		> -->
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
		<!-- </div> -->
	{/if}
</drop-down>
