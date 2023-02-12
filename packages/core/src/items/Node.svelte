<script>
	import Connector from './Connector.svelte'
	import { defaultFields, defaultStateIcons } from '../constants'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
	export let content
	export let fields = defaultFields
	export let types = []
	export let stateIcons = defaultStateIcons.node
	export let linesVisible = true
	export let selected = false
	export let using = {}

	$: hasChildren = fields.children in content
	$: component = content[fields.component]
		? using[content[fields.component]] || using.default
		: using.default

	function toggle() {
		if (hasChildren) content.isOpen = !content.isOpen
		dispatch('select', content)
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<node
	class="flex flex-row h-8 gap-2 leading-loose items-center cursor-pointer select-none"
	class:is-selected={selected}
	on:click={toggle}
>
	{#each types.slice(1) as type}
		<Connector type={linesVisible ? type : 'empty'} />
	{/each}

	{#if hasChildren}
		<span class="flex flex-col w-4 h-full items-center justify-center">
			{#if content.isOpen}
				<icon class={stateIcons.opened} aria-label="collapse" />
			{:else}
				<icon class={stateIcons.closed} aria-label="expand" />
			{/if}
		</span>
	{/if}
	<!-- Replace this with component -->
	<svelte:component this={component} bind:content />
	<!-- {#if content[fields.image]}
		<img
			class="h-8 w-8 rounded-full"
			alt={content[fields.text]}
			src={content[fields.image]}
		/>
	{/if}
	{#if content[fields.icon]}
		<icon class={content[fields.icon]} title={content[fields.text]} />
	{/if} -->

	<!-- <p class="flex flex-grow">{content[fields.text]}</p> -->
</node>
