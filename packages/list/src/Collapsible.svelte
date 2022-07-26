<script>
	import { createEventDispatcher } from 'svelte'

	import { Icon } from '@sparsh-ui/icons'
	import { defaultFields } from './constants'
	import List from './List.svelte'

	const dispatch = createEventDispatcher()

	export let content
	export let items = []
	export let fields = {}
	export let using = {}
	export let selected = null
	export let expanded = false

	$: fields = { ...defaultFields, ...fields }

	function toggle() {
		expanded = !expanded
		if (expanded) {
			dispatch('expand', { id: content[fields.groupId] })
		}
	}
</script>

<span
	class:expanded
	on:click={toggle}
	class="flex flex-shrink-0 items-center w-full leading-loose h-10 border-b px-4 min-h-12 justify-between select-none cursor-pointer collapsible"
>
	{#if fields.component in content}
		<svelte:component
			this={using[content[fields.component]]}
			{content}
			{expanded}
		/>
	{:else}
		{#if content[fields.image]}
			<img
				class="h-8 w-8 rounded-full"
				alt={content[fields.text]}
				src={content[fields.image]}
			/>
		{/if}
		{#if content[fields.icon]}
			<Icon name={content[fields.icon]} title={content[fields.text]} />
		{/if}
		<p class="flex flex-grow">{content[fields.text]}</p>
		{#if expanded}
			<Icon name="chevron-down" title="Collapse" />
		{:else}
			<Icon name="chevron-right" title="Expand" />
		{/if}
	{/if}
</span>

{#if expanded}
	<List bind:items bind:selected {fields} {using} on:select on:change />
{/if}
