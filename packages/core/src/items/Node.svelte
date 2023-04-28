<script>
	import Connector from './Connector.svelte'
	import { defaultFields, defaultStateIcons } from '../constants'
	// import { getLineTypes } from '../lib/connector'
	// import { has } from 'ramda'
	// import { createEventDispatcher } from 'svelte'

	// const dispatch = createEventDispatcher()
	export let content
	export let fields = defaultFields
	export let types = []
	export let stateIcons = defaultStateIcons.node
	// export let linesVisible = true
	export let selected = false
	export let using = {}
	export let rtl = false
	export let path = []

	$: stateIcons = { ...defaultStateIcons.node, ...(stateIcons ?? {}) }
	$: hasChildren = fields.children in content
	$: state =
		hasChildren && content[fields.isOpen]
			? { icon: stateIcons.opened, label: 'collapse' }
			: { icon: stateIcons.closed, label: 'expand' }
	$: component = content[fields.component]
		? using[content[fields.component]] || using.default
		: using.default
	// $: types = [...types, ...(hasChildren ? [] : ['empty'])]
	// $: types = getLineTypes(hasChildren, types)
	// function toggle() {
	// 	if (hasChildren) content[fields.isOpen] = !content[fields.isOpen]
	// 	dispatch('select', content)
	// }
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
	<!-- {#each types.slice(1) as type}
		<Connector {type} />
	{/each} -->

	<!-- {#if hasChildren}
		<span class="flex flex-col w-4 h-full items-center justify-center">
			<icon class={state.icon} aria-label={state.label} tabindex="-1" />
		</span>
	{/if} -->
	<fragment>
		<svelte:component this={component} bind:content {fields} />
	</fragment>
</node>
