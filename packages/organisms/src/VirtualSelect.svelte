<script>
	import { run } from 'svelte/legacy'

	import { defaultFields, defaultStateIcons, getComponent } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'
	import { delegateKeyboardEvents } from '@rokkit/actions'
	import VirtualList from './VirtualList.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} [value]
	 * @property {any} options
	 * @property {number} [visibleCount]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [using]
	 * @property {any} [icons]
	 * @property {number} [tabindex]
	 * @property {string} [placeholder]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		value = $bindable(null),
		options,
		visibleCount = 5,
		fields = $bindable({}),
		using = $bindable({}),
		icons = defaultStateIcons.selector,
		tabindex = 0,
		placeholder = 'Select',
		children
	} = $props()

	let selector = $state()
	let open = $state(true)
	// let index = null
	let start = 0

	run(() => {
		fields = { ...defaultFields, ...fields }
	})
	run(() => {
		using = { default: Item, ...using }
	})
</script>

<input-select use:delegateKeyboardEvents={{ selector: 'virtual-list' }}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<selected-item
		role="option"
		aria-selected={value !== null && !open}
		bind:this={selector}
		{tabindex}
		onclick={() => (open = true)}
		onblur={() => (open = false)}
		class="flex items-center"
	>
		{#if children}{@render children()}{:else if value === null}
			<p class="placeholder">{placeholder}</p>
		{:else}
			{@const component = getComponent(value, fields, using)}
			{@const props = typeof value === 'object' ? value[fields.props] || { fields } : { fields }}
			{@const SvelteComponent = component}
			<SvelteComponent bind:value {...props} />
		{/if}
		{#if open}
			<Icon name={icons.opened} label="opened" tabindex="-1" />
		{:else}
			<Icon name={icons.closed} label="closed" tabindex="-1" />
		{/if}
	</selected-item>
	{#if open}
		<VirtualList
			items={options}
			bind:value
			limit={visibleCount}
			{fields}
			{using}
			{start}
			tabindex={-1}
			anchor={selector}
		/>
	{/if}
</input-select>
