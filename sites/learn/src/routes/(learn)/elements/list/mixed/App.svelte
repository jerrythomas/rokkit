<script>
	import { List, Item } from '@rokkit/ui'
	import { FieldMapper } from '@rokkit/core'
	import { items } from './data.js'
	import Odd from './Odd.svelte'
	import Even from './Even.svelte'

	let fields = { text: 'name', image: 'photo', component: 'type' }
</script>

<List {items} {fields}>
	{#snippet odd(node)}
		<Odd value={node.value} />
	{/snippet}
	{#snippet even(node)}
		<Even value={node.value} />
	{/snippet}
</List>
