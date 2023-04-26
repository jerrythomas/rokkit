<script>
	import { getContext } from 'svelte'
	// import GraphPaper from '$lib/GraphPaper.svelte'
	const story = getContext('story')

	$: name = $story.metadata?.name ?? $story.name
	$: skin = $story.metadata?.skin ?? ''
</script>

<section class="flex flex-col w-full h-full overflow-hidden">
	<h1
		class="flex w-full items-center text-2xl px-4 h-12 flex-shrink-0 flex-grow bg-skin-300 bg-opacity-50 shadow"
	>
		{name}
	</h1>
	<div class="p-8 bg-skin-muted">
		<!-- <GraphPaper class={skin}> -->
		<svelte:component this={$story.current.preview} />
		<!-- </GraphPaper> -->
	</div>
</section>
