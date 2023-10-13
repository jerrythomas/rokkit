<script>
	import { defaultFields, defaultStateIcons, getComponent } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'
	import { delegateKeyboardEvents } from '@rokkit/actions'
	import VirtualList from './VirtualList.svelte'

	export let value = null
	export let options
	export let visibleCount = 5
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = {}
	export let using = {}
	export let icons = defaultStateIcons.selector
	export let tabindex = 0
	export let placeholder = 'Select'

	let selector
	let open = true
	// let index = null
	let start = 0

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
</script>

<input-select use:delegateKeyboardEvents={{ selector: 'virtual-list' }}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<selected-item
		role="option"
		aria-selected={value !== null && !open}
		bind:this={selector}
		{tabindex}
		on:click={() => (open = true)}
		on:blur={() => (open = false)}
		class="flex items-center"
	>
		<slot>
			{#if value === null}
				<p class="placeholder">{placeholder}</p>
			{:else}
				{@const component = getComponent(value, fields, using)}
				{@const props = typeof value === 'object' ? value[fields.props] || { fields } : { fields }}
				<svelte:component this={component} bind:value {...props} />
			{/if}
		</slot>
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
