<script>
	import { onMount } from 'svelte'
	import { defaultFields } from './constants'
	import List from './List.svelte'
	import Collapsible from './items/Collapsible.svelte'

	export let items = []
	export let fields = {}
	export let using = {}
	export let selected
	export let autoClose = false
	let previous = null
	let expanded = {}

	$: fields = { ...defaultFields, ...fields }
	$: using = { collapsible: Collapsible, ...using }

	onMount(() => {
		if (autoClose) {
			items = items.map((item) => ({ ...item, collapsed: true }))
		}

		// expanded = items.reduce((acc, d) => ({ ...acc, [d[fields.id]]: false }), {})
	})

	function handleToggle(event) {
		console.log(event)
		if (autoClose) {
			if (previous && previous != event.detail && !previous.collapsed) {
				previous.collapsed = true
			}
			previous = event.detail
		}
	}
</script>

<accordion class="flex flex-col flex-shrink-0 w-full select-none">
	{#each items as item}
		<svelte:component
			this={using.collapsible}
			bind:content={item}
			{fields}
			on:toggle={handleToggle}
		/>
		{#if item[fields.data] && !item.collapsed}
			<List
				bind:items={item[fields.data]}
				{fields}
				{using}
				bind:selected
				on:click
				on:change
			/>
		{/if}

		<!-- <Collapsible
			id={parent[fields.groupId]}
			bind:name={parent[fields.text]}
			bind:items={parent[fields.data]}
			bind:selected
			bind:expanded={expanded[parent[fields.groupId]]}
			key={fields.itemId}
			icon={parent[fields.icon]}
			{component}
			on:expand={collapseOthers}
			on:select
			on:change
		/> -->
	{/each}
</accordion>
