<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import { dismissable } from '@rokkit/actions'
	import { Icon, Slider } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'
	import List from './List.svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let options = []
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
	aria-haspopup="true"
	aria-controls="menu"
>
	<button
		class="flex items-center"
		bind:clientHeight={offsetTop}
		tabindex="0"
		use:dismissable
		on:dismiss={() => (open = false)}
		on:focus={() => (open = true)}
		on:blur={() => (open = false)}
	>
		<span class="flex items-center">
			{#if icon !== null}
				<Icon name={icon} />
			{/if}
			{#if !small && title}
				<p class="w-full flex">{title}</p>
			{/if}
			{#if open}
				<Icon name={icons.opened} />
			{:else}
				<Icon name={icons.closed} />
			{/if}
		</span>
	</button>
	{#if open}
		<Slider top={offsetTop + 4}>
			<List items={options} {fields} {using} bind:value on:select={handleSelect} tabindex="-1" />
		</Slider>
	{/if}
</drop-down>
