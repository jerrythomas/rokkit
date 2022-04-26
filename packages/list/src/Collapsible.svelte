<script>
	import Collapsed from './icons/Collapsed.svelte'
	import Expanded from './icons/Expanded.svelte'
	import List from './List.svelte'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let id
	export let icon
	export let name
	export let items
	export let expanded = false

	export let component
	export let key = 'id'
	export let selected

	function toggle() {
		expanded = !expanded
		if (expanded) {
			dispatch('expand', { id })
		}
	}

	// $: console.log(expanded, items)
</script>

<span
	class:expanded
	on:click={toggle}
	class="flex flex-shrink-0 items-center w-full leading-loose h-10 border-b px-4 min-h-12 justify-between select-none cursor-pointer collapsible"
>
	{#if icon}
		<svelte:component this={icon} />
	{/if}
	{name}
	{#if expanded}
		<Expanded />
	{:else}
		<Collapsed />
	{/if}
</span>

{#if expanded}
	<List bind:items bind:selected {key} {component} on:select on:change />
{/if}
