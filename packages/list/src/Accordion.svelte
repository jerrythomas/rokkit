<script>
	import { onMount } from 'svelte'
	import { defaultFields } from './constants'
	import Collapsible from './Collapsible.svelte'

	export let data = []
	export let component
	export let selected
	export let autoClose = false
	export let fields

	$: fields = { ...defaultFields, ...fields }
	let previous = null
	let expanded = {}

	onMount(() => {
		expanded = data.reduce(
			(acc, d) => ({ ...acc, [d[fields.groupId]]: false }),
			{}
		)
		// expanded = Object.keys(lookup).reduce(
		// 	(obj, k) => ({ ...obj, [k]: false }),
		// 	{}
		// )
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
		/>
	{/each}
</accordion>
