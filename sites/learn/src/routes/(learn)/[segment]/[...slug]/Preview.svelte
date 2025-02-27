<script>
	import { getContext } from 'svelte'
	const story = getContext('tutorial')()
</script>

<section class="flex h-full w-full flex-col gap-4 overflow-scroll p-8">
	{#if story}
		{@const Template = story.src.preview}
		<Template />
	{/if}
</section>
