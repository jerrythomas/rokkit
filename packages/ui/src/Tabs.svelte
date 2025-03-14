<script>
	import { defaultFields, defaultStateIcons, noop } from '@rokkit/core'
	import { defaultMapping } from './constants'
	import { navigator } from '@rokkit/actions'
	import Icon from './Icon.svelte'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [options]
	 * @property {import('@rokkit/core').FieldMapping} [mapping]
	 * @property {any} [value]
	 * @property {boolean} [below]
	 * @property {string} [align]
	 * @property {boolean} [editable]
	 * @property {any} [icons]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		options = $bindable([]),
		fields = defaultFields,
		mapping = defaultMapping,
		value = $bindable(null),
		below = false,
		align = 'left',
		editable = false,
		icons = $bindable(defaultStateIcons.action),
		onremove = noop,
		onadd = noop,
		onselect = noop
	} = $props()

	let cursor = $state([])

	function handleRemove(event) {
		if (typeof event.detail === Object) {
			event.detail[mapping.fields.isDeleted] = true
		} else {
			options = options.filter((i) => i !== event.detail)
		}

		onremove({ item: event.detail })
	}
	function handleAdd(event) {
		event.stopPropagation()
		onadd()
	}
	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		onselect({ item: value, indices: cursor })
	}
	let stateIcons = $derived({ ...defaultStateIcons.action, ...icons })
	let filtered = $derived(options.filter((item) => !item[fields.isDeleted]))
</script>

<rk-tabs
	class="flex w-full {className}"
	class:is-below={below}
	class:justify-center={align === 'center'}
	class:justify-end={align === 'right'}
	tabindex="0"
	role="listbox"
	onmove={handleNav}
	onselect={handleNav}
>
	{#each filtered as item, index}
		{@const Template = mapping.getComponent(item)}
		<rk-tab>
			<Template value={item} {mapping} />
			{#if editable}
				<Icon
					name="remove"
					role="button"
					label="Delete Tab"
					size="small"
					onclick={() => handleRemove(item)}
				/>
			{/if}
		</rk-tab>
	{/each}
	{#if editable}
		<Icon name="add" role="button" label="Add Tab" size="small" on:click={handleAdd} />
	{/if}
</rk-tabs>
