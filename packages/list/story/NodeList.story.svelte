<script>
	import NodeList from '../src/NodeList.svelte'

	let variants = [
		{
			title: 'Array of objects',
			summary: 'A NodeList can be created by passing an array of objects. ',
			props: {
				items: [{ text: 'Alpha' }, { text: 'Beta' }, { text: 'Delta' }]
			}
		},
		{
			title: 'Nested array',
			summary: 'A NodeList can be created by passing an array of objects. ',
			props: {
				items: [
					{ text: 'Alpha', data: [{ text: 'One' }] },
					{
						text: 'Beta',
						data: [
							{ text: 'One' },
							{ text: 'Two', data: [{ text: 'One' }, { text: 'Two' }] }
						]
					},
					{ text: 'Delta' }
				]
			}
		}
	]
</script>

<main class="flex flex-row gap-2 flex-grow items-center">
	{#each variants as { title, summary, props }}
		<section class="flex flex-col gap-4">
			<h1 class="flex-start">{title}</h1>
			<NodeList {...props} />
			<p>{summary}</p>
		</section>
	{/each}
</main>
