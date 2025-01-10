<script>
	import { defaultFields, defaultStateIcons, createEmitter } from '@rokkit/core'
	import { dismissable } from '@rokkit/actions'
	import { Icon, Slider } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'
	import List from './List.svelte'

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
		small = false,
		...events
	} = $props()

	// $effect.pre(() => {
	// using = { default: Item, ...using }
	// fields = { ...defaultFields, ...fields }
	// })
	let internalUsing = $derived({ default: Item, ...using })
	let internalFields = $derived({ ...defaultFields, ...fields })

	let emitter = createEmitter(events, ['change'])
	let offsetTop = $state(0)
	let open = $state(false)
	let icons = defaultStateIcons.selector

	function handleSelect(data) {
		open = false
		emitter.change(data)
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
			<List
				items={options}
				fields={internalFields}
				using={internalUsing}
				bind:value
				onselect={handleSelect}
				tabindex="-1"
			/>
		</Slider>
	{/if}
</drop-down>
