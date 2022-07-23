<script>
	import List from '../src/List.svelte'
	import * as all from '../src/items'

	let variants = [
		{
			title: 'Simple Array',
			summary: 'A List can be created by passing an array if strings. ',
			props: { items: ['Alpha', 'Beta', 'Delta'] }
		},
		{
			title: 'Object Array',
			summary:
				'You can also pass an array of objects with a text attribute containing the values to be displayed.',
			props: { items: [{ text: 'One' }, { text: 'Two' }, { text: 'Three' }] }
		},
		{
			title: 'Field Mapping',
			summary:
				'An array of objects can also be passed with a field mapping to indicate which fields should be used for display.',
			props: {
				items: [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }],
				fields: { text: 'name' }
			}
		},
		{
			title: 'Mixed Content',
			summary:
				'Each item can be unique and a different component can be used to display teh content.',
			props: {
				items: [
					{ name: 'Panda', url: '/1', component: 'Link' },
					{ name: 'Monkey' },
					{ name: 'Viper', icon: 'i-carbon-sun', component: 'Link' }
				],
				fields: { text: 'name' },
				using: all
			}
		}
	]
</script>

<main class="flex flex-row gap-2 flex-grow items-center">
	{#each variants as { title, summary, props }}
		<section>
			<h1 class="flex-start">{title}</h1>

			<List {...props} />
			<p>{summary}</p>
		</section>
	{/each}
</main>

<style lang="postcss">
	section {
		@apply flex flex-col items-center w-60 h-60 gap-5;
	}
	section p {
		@apply px-4 flex text-sm italic;
	}
</style>
