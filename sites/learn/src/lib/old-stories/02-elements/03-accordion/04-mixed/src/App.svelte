<script>
	import { Accordion } from '@rokkit/ui'
	import { data } from './data.js'
	import Odd from './Odd.svelte'
	import Even from './Even.svelte'

	let fields = {
		text: 'name',
		children: 'values',
		component: 'type',
		image: 'photo'
	}
	let items = $state(data)
</script>

<Accordion bind:items {fields}>
	{#snippet odd(node)}
		<Odd value={node.value} />
	{/snippet}
	{#snippet even(node)}
		<Even value={node.value} />
	{/snippet}
</Accordion>
