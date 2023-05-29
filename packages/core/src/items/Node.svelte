<script>
	import { defaultFields, defaultStateIcons } from '../constants'
	import Icon from '../Icon.svelte'
	import Connector from './Connector.svelte'

	export let value
	export let fields = defaultFields
	export let types = []
	export let stateIcons = defaultStateIcons.node

	export let selected = false
	export let using = {}
	export let rtl = false
	export let path = []

	$: stateIcons = { ...defaultStateIcons.node, ...(stateIcons ?? {}) }
	$: hasChildren = fields.children in value
	$: state =
		hasChildren && value[fields.isOpen]
			? { icon: stateIcons.opened, label: 'collapse' }
			: { icon: stateIcons.closed, label: 'expand' }
	$: component = value[fields.component]
		? using[value[fields.component]] || using.default
		: using.default
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<node
	id={'id-' + path.join('-')}
	class="min-h-5 flex flex-row cursor-pointer select-none items-center"
	class:is-selected={selected}
	class:flex-row-reverse={rtl}
	aria-selected={selected}
	role="option"
	data-path={path.join(',')}
>
	{#each types as type}
		{#if type === 'icon'}
			<Icon name={state.icon} label={state.label} class="small w-4" />
		{:else}
			<Connector {type} />
		{/if}
	{/each}
	<item>
		<svelte:component this={component} bind:value {fields} />
	</item>
</node>
