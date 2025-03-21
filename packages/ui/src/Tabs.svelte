<script>
	import { defaultFields, defaultStateIcons, noop, getSnippet } from '@rokkit/core'
	import { ListProxy } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import Icon from './Icon.svelte'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [options]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
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
		value = $bindable(null),
		icons = $bindable(defaultStateIcons.action),
		fields = defaultFields,
		below = false,
		align = 'left',
		editable = false,
		onremove = noop,
		onadd = noop,
		onselect = noop,
		stub,
		...extra
	} = $props()

	let cursor = $state([])

	function handleRemove(event) {
		if (typeof event.detail === Object) {
			event.detail[fields.isDeleted] = true
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
	let wrapper = new ListProxy(options, value, fields)
</script>

<rk-tabs
	class="flex w-full {className}"
	class:is-below={below}
	class:justify-center={align === 'center'}
	class:justify-end={align === 'right'}
	tabindex="0"
	role="listbox"
	use:navigator={{ wrapper }}
	onaction={handleNav}
	onremove={handleRemove}
	onadd={handleAdd}
>
	{#each wrapper.nodes as item, index}
		{@const Template = getSnippet(extra, item.get('component')) ?? stub}
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
		<Icon name="add" role="button" label="Add Tab" size="small" onclick={handleAdd} />
	{/if}
</rk-tabs>
