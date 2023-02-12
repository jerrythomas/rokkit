<script>
	import { PageNavigator } from '@rokkit/core'
	import { getContext } from 'svelte'

	const story = getContext('story')

	// $: typeof window !== 'undefined' && window.alert(slide.title)
</script>

<aside
	class="flex flex-col w-full h-full pb-12 border-r border-r-skin-200 relative overflow-hidden"
>
	{#if $story.current}
		<notes class="markdown-body px-4 py-2 w-full overflow-auto">
			<svelte:component this={$story.current.notes} />
		</notes>
		{#if $story.pages.length > 1}
			<PageNavigator
				items={$story.pages}
				fields={{ text: 'title' }}
				bind:value={$story.current}
				class="min-h-12 bg-skin-400 absolute bottom-0"
			/>
		{/if}
	{:else}
		<span>No Content</span>
	{/if}
</aside>
