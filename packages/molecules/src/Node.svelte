<script>
	import { defaultFields, defaultStateIcons, getComponent, isExpanded } from '@rokkit/core'
	import { Icon, Connector } from '@rokkit/atoms'

	export let value
	export let fields = defaultFields
	export let types = []
	export let stateIcons = defaultStateIcons.node

	export let selected = false
	export let using = {}
	export let rtl = false
	export let path = []

	$: stateIcons = { ...defaultStateIcons.node, ...stateIcons }
	$: stateName = isExpanded(value, fields) ? 'opened' : 'closed'
	$: state = isExpanded(value, fields)
		? { icon: stateIcons.opened, label: 'collapse' }
		: { icon: stateIcons.closed, label: 'expand' }
	$: component = getComponent(value, fields, using)
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
			<svelte:component this={component} bind:value {fields} />
		</item>
	</div>
	<slot />
</node>
