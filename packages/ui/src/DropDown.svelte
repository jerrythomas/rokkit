<script>
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import { dismissable } from '@rokkit/actions'
	import Icon from './Icon.svelte'
	import Slider from './Slider.svelte'
	import Item from './Item.svelte'
	import List from './List.svelte'

	let {
		class: className,
		options = [],
		fields = defaultFields,
		using = { default: Item },
		value = null,
		title = null,
		icon = null,
		small = false,
		disabled = false
	} = $props()

	using = { default: Item, ...using }
	fields = { ...defaultFields, ...fields }

	let offsetTop = $state(0)
	let open = $state(false)
	let icons = defaultStateIcons.selector

	function handleSelect(event) {
		open = false
		// dispatch('change', event.detail)
	}
</script>

<drop-down
	class="dropdown relative flex cursor-pointer select-none {className}"
	class:open
	aria-haspopup="true"
	aria-controls="menu"
>
	<button
		class="flex items-center"
		bind:clientHeight={offsetTop}
		tabindex="0"
		use:dismissable
		ondismiss={() => (open = false)}
		onfocus={() => (open = true)}
		onblur={() => (open = false)}
	>
		<span class="flex items-center">
			{#if icon !== null}
				<Icon name={icon} />
			{/if}
			{#if !small && title}
				<p class="flex w-full">{title}</p>
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
			<List items={options} {fields} {using} bind:value onselect={handleSelect} tabindex="-1" />
		</Slider>
	{/if}
</drop-down>
