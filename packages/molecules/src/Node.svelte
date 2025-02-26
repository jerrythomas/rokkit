<script>
	import { defaultStateIcons } from '@rokkit/core'
	import { defaultMapping } from './constants'
	import { Icon, Connector } from '@rokkit/atoms'

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
		value = $bindable(),
		mapping = defaultMapping,
		types = [],
		stateIcons = defaultStateIcons.node,
		selected = false,
		expanded = false,
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
	id={'id-' + path.join('-')}
	class="node flex min-h-5 cursor-pointer select-none flex-col"
	aria-selected={selected}
	aria-expanded={state.label === 'collapse'}
	role="treeitem"
	data-path={path.join(',')}
>
	<div class="flex flex-row items-center">
		{#each types as type}
			{#if type === 'icon'}
				<Icon name={state.icon} label={state.label} state={stateName} class="small w-4" />
			{:else}
				<Connector {type} />
			{/if}
		{/each}
		<rk-item>
			<Template bind:value {mapping} />
		</rk-item>
	</div>
	{@render children?.()}
</rk-node>
