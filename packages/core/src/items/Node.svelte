<script>
	import Connector from './Connector.svelte'
	import { defaultFields, defaultStateIcons } from '../constants'

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
	class="flex flex-row min-h-5 items-center cursor-pointer select-none"
	class:is-selected={selected}
	class:flex-row-reverse={rtl}
	aria-selected={selected}
	role="option"
	data-path={path.join(',')}
>
	{#each types as type}
		{#if type === 'icon'}
			<span class="flex flex-col w-4 h-full items-center justify-center">
				<icon class={state.icon} aria-label={state.label} tabindex="-1" />
			</span>
		{:else}
			<Connector {type} />
		{/if}
	{/each}
	<item>
		<svelte:component this={component} bind:value {fields} />
	</item>
</node>
