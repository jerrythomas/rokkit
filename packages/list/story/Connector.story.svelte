<script>
	import Connector from '../src/items/Connector.svelte'

	const variants = [
		{ title: 'last', props: { type: 'last' } },
		{ title: 'middle', props: { type: 'middle' } },
		{ title: 'line', props: { type: 'line' } },
		{ title: 'empty', props: { type: 'empty' } }
	]
</script>

<main class="flex flex-row gap-2 flex-grow items-center">
	{#each variants as { title, summary, props }}
		<section>
			<h1 class="flex-start">{title}</h1>
			<wrap class="flex h-8 border border-red-500">
				<Connector {...props} />
			</wrap>
		</section>
	{/each}
</main>
