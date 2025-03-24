<script>
	import { SvelteSet } from 'svelte/reactivity'
	import { defaultStateIcons, getKeyFromPath, getSnippet, FieldMapper } from '@rokkit/core'
	import Icon from './Icon.svelte'
	import Connector from './Connector.svelte'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {any} [types]
	 * @property {import('./types').NodeStateIcons} [stateIcons]
	 */

	/** @type {Props} */
	let {
		value = $bindable(null),
		fields,
		types = [],
		stateIcons = defaultStateIcons.node,
		path = [],
		stub = null,
		children,
		focusedKey,
		selectedKeys = new SvelteSet(),
		expandedKeys = new SvelteSet(),
		...extra
	} = $props()

	const key = $derived(getKeyFromPath(path))
	let icons = $derived({ ...defaultStateIcons.node, ...stateIcons })
	let stateName = $derived(expandedKeys.has(key) ? 'opened' : 'closed')
	let state = $derived(
		expandedKeys.has(key)
			? { icon: icons.opened, label: 'collapse' }
			: { icon: icons.closed, label: 'expand' }
	)
	const mapper = new FieldMapper(fields)

	const template = getSnippet(mapper.get('component', value), extra, stub)
	// $inspect(value.focused, value.expanded, value.selected, value.get('text'))
</script>

<rk-node
	aria-current={focusedKey === key}
	aria-selected={selectedKeys.has(key)}
	aria-expanded={expandedKeys.has(key)}
	role="treeitem"
	data-path={getKeyFromPath(path)}
	data-depth={path.length}
>
	<div class="flex flex-row items-center">
		{#each types as type}
			{#if type === 'icon'}
				<Icon name={state.icon} label={state.label} state={stateName} class="w-4" size="small" />
			{:else}
				<Connector {type} />
			{/if}
		{/each}
		<rk-item>
			{#if template}
				{@render template(value)}
			{:else}
				<Item {value} {fields} />
			{/if}
		</rk-item>
	</div>
	{@render children?.()}
</rk-node>
