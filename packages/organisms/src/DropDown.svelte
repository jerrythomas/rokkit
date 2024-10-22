<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import { dismissable } from '@rokkit/actions'
	import { Icon, Slider } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'
	import List from './List.svelte'

	const dispatch = createEventDispatcher()

	
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [options]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [using]
	 * @property {any} [value]
	 * @property {any} [title]
	 * @property {any} [icon]
	 * @property {boolean} [small]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		options = [],
		fields = $bindable(defaultFields),
		using = $bindable({ default: Item }),
		value = $bindable(null),
		title = null,
		icon = null,
		small = false
	} = $props();

	run(() => {
		using = { default: Item, ...using }
	});
	run(() => {
		fields = { ...defaultFields, ...fields }
	});

	let offsetTop = $state(0)
	let open = $state(false)
	let icons = defaultStateIcons.selector

	function handleSelect(event) {
		open = false
		dispatch('change', event.detail)
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
		ondismiss={() => (open = false)}
		onfocus={() => (open = true)}
		onblur={() => (open = false)}
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
