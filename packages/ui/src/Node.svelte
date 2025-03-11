<script>
	import { defaultStateIcons, getKeyFromPath } from '@rokkit/core'
	import { defaultMapping } from './constants'
	import Icon from './Icon.svelte'
	import Connector from './Connector.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {any} [types]
	 * @property {import('./types').NodeStateIcons} [stateIcons]
	 * @property {boolean} [selected]
	 * @property {boolean} [expanded]
	 * @property {number[]} [path]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		value = $bindable(),
		mapping = defaultMapping,
		types = [],
		stateIcons = defaultStateIcons.node,
		selected = $bindable(false),
		expanded = false,
		current = false,
		path = [],
		children
	} = $props()

	let icons = $derived({ ...defaultStateIcons.node, ...stateIcons })
	let stateName = $derived(expanded ? 'opened' : 'closed')
	let state = $derived(
		expanded ? { icon: icons.opened, label: 'collapse' } : { icon: icons.closed, label: 'expand' }
	)

	const Template = $derived(mapping.getComponent(value))
</script>

<rk-node
	class={classes}
	aria-current={current}
	aria-selected={selected}
	aria-expanded={state.label === 'collapse'}
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
			<Template {value} {mapping} />
		</rk-item>
	</div>
	{@render children?.()}
</rk-node>
