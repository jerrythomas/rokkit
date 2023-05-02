<script>
	import { getContext } from 'svelte'
	const story = getContext('tutorial')
</script>

<section class="flex flex-col w-full h-full overflow-scroll p-8 gap-4">
	{#if $story}
		<svelte:component this={$story.preview} />
	{/if}
</section>
