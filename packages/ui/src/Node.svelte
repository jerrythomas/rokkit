<script>
	import { defaultStateIcons, getKeyFromPath, getSnippet } from '@rokkit/core'
	import Icon from './Icon.svelte'
	import Connector from './Connector.svelte'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object}                            Props
	 * @property {any}                              value
	 * @property {import('./types').FieldMapping}   fields
	 * @property {any}                              [types]
	 * @property {import('./types').NodeStateIcons} [stateIcons]
	 * @property {number[]}                         [path=[]]
	 * @property {boolean}                          [focused=false]
	 * @property {boolean}                          [selected=false]
	 * @property {boolean}                          [expanded=false]
	 * @property {Function}                         [children]
	 * @property {Function}                         [stub=null]
	 * @property {Object<string, Function>}         [snippets={}]
	 */

	/** @type {Props} */
	let {
		value = $bindable(null),
		fields,
		types = [],
		stateIcons = defaultStateIcons.node,
		path = [],
		focused = false,
		selected = false,
		expanded = false,
		children,
		stub = null,
		snippets = {}
	} = $props()

	let stateName = $derived(expanded ? 'opened' : 'closed')
	let icons = $derived({ ...defaultStateIcons.node, ...stateIcons })
	let state = $derived(
		expanded ? { icon: icons.opened, label: 'collapse' } : { icon: icons.closed, label: 'expand' }
	)

	const template = getSnippet(value[fields.snippet], snippets, stub)
	$inspect(template)
</script>

<rk-node
	aria-current={focused}
	aria-selected={selected}
	aria-expanded={expanded}
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
			<svelte:boundary>
				<!-- {#if template} -->
				{@render template(value)}
				{#snippet failed()}
					<Item {value} {fields} />
				{/snippet}
				<!-- {:else}
					<Item {value} {fields} />
				{/if} -->
			</svelte:boundary>
		</rk-item>
	</div>
	{@render children?.()}
</rk-node>
