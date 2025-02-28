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
		class: classes = '',
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
	const id = $derived('id-' + path.join('-'))
</script>

<rk-node
	{id}
	class={classes}
	aria-selected={selected}
	aria-expanded={state.label === 'collapse'}
	role="treeitem"
	data-path={path.join(',')}
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
			<Template bind:value {mapping} />
		</rk-item>
	</div>
	{@render children?.()}
</rk-node>
