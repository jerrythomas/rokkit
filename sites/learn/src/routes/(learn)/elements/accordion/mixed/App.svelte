<script>
	import { Accordion } from '@rokkit/ui'
	import Odd from './Odd.svelte'
	import Even from './Even.svelte'
	
	const data = [
		{
			name: 'Featured Fruits',
			values: [
				{
					name: 'Apple',
					photo: '/examples/apple.jpg',
					type: 'featured',
					description: 'Crisp and sweet, apples are perfect for snacking or baking. Rich in fiber and vitamin C.'
				},
				{
					name: 'Banana',
					type: 'simple',
					description: 'High in potassium and natural sugars.'
				}
			]
		},
		{
			name: 'Exotic Items',
			values: [
				{
					name: 'Dragon Fruit',
					photo: '/examples/dragon-fruit.jpg',
					type: 'featured',
					description: 'Exotic fruit with unique appearance and mild, sweet flavor. Packed with antioxidants.'
				},
				{
					name: 'Passion Fruit',
					type: 'simple',
					description: 'Intensely flavored tropical fruit.'
				}
			]
		}
	]

	const fields = {
		text: 'name',
		children: 'values',
		component: 'type'
	}
</script>

<Accordion items={data} {fields}>
	{#snippet featured(node)}
		<Odd value={node.value} />
	{/snippet}
	{#snippet simple(node)}
		<Even value={node.value} />
	{/snippet}
</Accordion>