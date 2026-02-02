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
	 * @property {boolean}                          [disabled=false]
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
		disabled = false,
		children,
		stub = null,
		snippets = {}
	} = $props()

	let stateName = $derived(expanded ? 'opened' : 'closed')
	let icons = $derived({ ...defaultStateIcons.node, ...stateIcons })
	let state = $derived(
		expanded ? { icon: icons.opened, label: 'collapse' } : { icon: icons.closed, label: 'expand' }
	)

	let template = $derived(getSnippet(value[fields.snippet], snippets, stub))
</script>

<div
	data-node
	aria-current={focused}
	aria-selected={selected}
	aria-expanded={expanded}
	aria-disabled={disabled}
	data-disabled={disabled}
	role="treeitem"
	data-path={getKeyFromPath(path)}
	data-depth={path.length}
	data-state={stateName}
>
	<div data-node-content>
		{#each types as type, index (index)}
			{#if type === 'icon'}
				<Icon name={state.icon} label={state.label} state={stateName} class="w-4" size="small" />
			{:else}
				<Connector {type} />
			{/if}
		{/each}
		<div data-node-item>
			<svelte:boundary>
				{#if template}
					{@render template(value)}
					{#snippet failed()}
						<Item {value} {fields} />
					{/snippet}
				{:else}
					<Item {value} {fields} />
				{/if}
			</svelte:boundary>
		</div>
	</div>
	{@render children?.()}
</div>
