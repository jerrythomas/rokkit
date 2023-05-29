<script>
	import { getContext } from 'svelte'
	const story = getContext('tutorial')
</script>

<section class="h-full w-full flex flex-col gap-4 overflow-scroll p-8">
	{#if $story}
		<svelte:component this={$story.preview} />
	{/if}
</section>
