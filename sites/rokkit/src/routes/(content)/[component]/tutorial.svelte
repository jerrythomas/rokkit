<script>
	import { CodeSnippet } from '@rokkit/markdown'
	import { snippet } from '$lib/snippet'
	/** @type {string} */
	export let skin
	/** @type {string} */
	export let name
	/** @type {Array<import('$lib/types').TutorialSlide>} */
	export let slides
</script>

<page
	class="flex flex-col gap-5 px-6 pb-12 mx-auto w-full md:max-w-screen-lg {skin}"
>
	<h1 class="text-3xl">{name}</h1>

	{#each slides as slide}
		{@const code = snippet(name, slide.props, slide.snippet)}
		<notes class="prose">
			<svelte:component this={slide.notes} />
		</notes>
		{#if slide.component}
			<preview class="overflow-auto">
				<wrapper class="h-full w-100 self-center overflow-auto">
					<svelte:component this={slide.component} {...slide.props} />
				</wrapper>
			</preview>
		{/if}
		{#if code}
			<CodeSnippet {code} language="svelte" />
		{/if}
	{/each}
</page>
