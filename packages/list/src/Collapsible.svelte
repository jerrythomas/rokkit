<script>
	import { createEventDispatcher } from 'svelte'

	import { Icon } from '@sparsh-ui/icons'
	import { defaultFields } from './constants'
	import List from './List.svelte'
	import ListItem from './ListItem.svelte'

	const dispatch = createEventDispatcher()

	export let id
	export let icon = null
	export let text = '?'
	export let items = []
	export let expanded = false

	export let component = null
	// export let key = 'id'
	export let selected = null
	export let fields

	$: fields = { ...defaultFields, ...fields }

	function toggle() {
		expanded = !expanded
		if (expanded) {
			dispatch('expand', { id })
		}
	}
</script>

<span
	class:expanded
	on:click={toggle}
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
	<List bind:items bind:selected {fields} {component} on:select on:change />
{/if}
