<script>
	import { Icon } from '@sparsh-ui/icons'
	import List from './List.svelte'
	import ListItem from './ListItem.svelte'

	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let id
	export let icon = null
	export let text = '?'
	export let items = []
	export let expanded = false

	export let component = ListItem
	export let key = 'id'
	export let selected = null

	function toggle() {
		expanded = !expanded
		if (expanded) {
			dispatch('expand', { id })
		}
	}
</script>

<span
	class:expanded
	on:click|stopPropagation={toggle}
	class="flex flex-shrink-0 items-center w-full leading-loose h-10 border-b px-4 min-h-12 justify-between select-none cursor-pointer collapsible"
>
	{#if icon}
		<Icon name={icon} />
	{/if}
	<p>{text}</p>
	{#if expanded}
		<Icon name="chevron-down" title="Collapse" />
	{:else}
		<Icon name="chevron-right" title="Expand" />
	{/if}
</span>

{#if expanded}
	<List bind:items bind:selected {key} {component} on:select on:change />
{/if}
