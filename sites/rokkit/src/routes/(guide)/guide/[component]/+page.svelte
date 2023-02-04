<script>
	import StoryGuide from '$lib/StoryGuide.svelte'

	export let data
</script>

<!-- {JSON.stringify(data.story)} -->
<!-- <svelte:component this={data.story.pages[0].preview} /> -->
<StoryGuide {...data.story} />
