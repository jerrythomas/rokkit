<script>
	import { defaultStateIcons, getKeyFromPath, getSnippet } from '@rokkit/core'
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
		value = $bindable(),
		types = [],
		stateIcons = defaultStateIcons.node,
		stub,
		...extra
	} = $props()

	let icons = $derived({ ...defaultStateIcons.node, ...stateIcons })
	let stateName = $derived(value.expanded ? 'opened' : 'closed')
	let state = $derived(
		value.expanded
			? { icon: icons.opened, label: 'collapse' }
			: { icon: icons.closed, label: 'expand' }
	)

	const template = getSnippet(value.get('component'), extra) ?? stub
</script>

<rk-node
	aria-current={value.focused}
	aria-selected={value.selected}
	aria-expanded={value.expanded}
	role="treeitem"
	data-path={getKeyFromPath(value.path)}
	data-depth={value.path.length}
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
				<Item value={value.value} fields={value.fields} />
			{/if}
		</rk-item>
	</div>
</rk-node>
