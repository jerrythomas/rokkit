<script>
	import { createEventDispatcher } from 'svelte'
	import { dismissable } from './actions'
	import { defaultFields, defaultStateIcons } from './constants.js'

	import Icon from './Icon.svelte'
	import Text from './items/Text.svelte'
	import List from './List.svelte'
	import Slider from './Slider.svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	export let fields = defaultFields
	export let using = { default: Text }
	export let value = null
	export let title
	export let icon
	export let small = false

	$: using = { default: Text, ...using }
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
	class="flex w-full relative cursor-pointer select-none dropdown {className}"
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
		class="flex"
		bind:clientHeight={offsetTop}
		tabindex="-1"
	>
		{#if icon}
			<Icon name={icon} />
		{/if}
		{#if !small && title}
			<p>{title}</p>
		{/if}
		{#if open}
			<icon class={icons.opened} />
		{:else}
			<icon class={icons.closed} />
		{/if}
	</button>
	{#if open}
		<!-- <div
			class="flex flex-col absolute z-10 h-fit w-full menu"
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
