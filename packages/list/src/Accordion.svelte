<script>
	import Collapsible from './Collapsible.svelte'
	import { onMount } from 'svelte'

	export let data = []
	export let component
	export let groupKey = 'key'
	export let itemKey = 'id'
	export let selected
	export let autoClose = false
	export let lookup = {}

	let previous = null
	let expanded = {}

	onMount(() => {
		expanded = Object.keys(lookup).reduce(
			(obj, k) => ({ ...obj, [k]: false }),
			{}
		)
	})

	function collapseOthers(event) {
		if (autoClose) {
			if (previous && previous !== event.detail.id) {
				expanded[previous] = false
			}
			previous = event.detail.id
		}
	}
</script>

<accordion class="flex flex-col flex-shrink-0 w-full">
	{#each data as parent}
		<Collapsible
			id={parent[groupKey]}
			bind:name={parent.name}
			bind:items={parent.data}
			bind:selected
			bind:expanded={expanded[parent[groupKey]]}
			key={itemKey}
			icon={parent.icon}
			{component}
			on:expand={collapseOthers}
			on:select
			on:change
		/>
	{/each}
</accordion>
