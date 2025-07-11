<script>
	import { Accordion } from '@rokkit/ui'
	import Link from './Link.svelte'
	import { data } from './data.js'

	const fields = {
		text: 'name',
		children: 'values',
		isOpen: 'isOpen',
		image: 'photo',
		url: 'source'
	}
	let items = $state(data)
</script>

<Accordion bind:items {fields}>
	{#snippet stub(node)}
		<Link href={node.get('url')}>{node.get('text')}</Link>
	{/snippet}
</Accordion>
