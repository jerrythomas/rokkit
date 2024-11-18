<script>
	import { defaultFields, defaultStateIcons, getComponent, isExpanded } from '@rokkit/core'
	import { Icon, Connector } from '@rokkit/atoms'

	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {any} [fields]
	 * @property {any} [types]
	 * @property {import('./types').NodeStateIcons} [stateIcons]
	 * @property {boolean} [selected]
	 * @property {object} [using]
	 * @property {boolean} [rtl]
	 * @property {integer[]} [path]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		value = $bindable(),
		fields = defaultFields,
		types = [],
		stateIcons = defaultStateIcons.node,
		selected = false,
		using = {},
		rtl = false,
		path = [],
		children
	} = $props()

	let icons = $derived({ ...defaultStateIcons.node, ...stateIcons })
	let stateName = $derived(isExpanded(value, fields) ? 'opened' : 'closed')
	let state = $derived(
		isExpanded(value, fields)
			? { icon: icons.opened, label: 'collapse' }
			: { icon: icons.closed, label: 'expand' }
	)
	let component = $derived(getComponent(value, fields, using))

	const SvelteComponent = $derived(component)
</script>

<node
	id={'id-' + path.join('-')}
	class="node min-h-5 flex flex-col cursor-pointer select-none"
	aria-selected={selected}
	aria-expanded={state.label === 'collapse'}
	role="treeitem"
	class:flex-row-reverse={rtl}
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
		<item>
			<SvelteComponent bind:value {fields} />
		</item>
	</div>
	{@render children?.()}
</node>
