<script>
	import { PageNavigator } from '@rokkit/core'
	import { CodeSnippet } from '@rokkit/markdown'
	import { snippet } from '$lib/snippet'

	/** @type {string} */
	export let skin
	/** @type {string} */
	export let name
	/** @type {Array<import('$lib/types').TutorialSlide>} */
	export let slides

	/** @type {import('$lib/types').TutorialSlide} */
	let slide = slides[0]

	function handlePathChanges(slides) {
		const matched = slides.find((x) => x === slide)
		if (!matched) {
			slide = slides[0]
		}
	}
	$: handlePathChanges(slides)
	$: code = slide ? snippet(name, slide.props, slide.snippet) : null
</script>

{#if slide}
	<page
		class="flex flex-col-reverse overflow-auto w-full h-full border-t border-t-skin-200 {skin} md:grid md:grid-cols-2"
	>
		<aside class="flex flex-col border-r border-r-skin-200 overflow-auto">
			<notes class="prose w-full overflow-scroll">
				<svelte:component this={slide.notes} />
				{#if code}
					<pre class="not-prose"><CodeSnippet {code} language="svelte" /></pre>
				{/if}
			</notes>
			<span class="flex flex-grow" />
			<PageNavigator
				items={slides}
				bind:value={slide}
				class="bg-skin-300 bg-opacity-50"
			/>
		</aside>

		<section class="flex flex-col ">
			<h1
				class="flex w-full items-center text-2xl px-8 min-h-12 max-h-12 bg-skin-300 bg-opacity-50 shadow"
			>
				&lt;{name}/&gt;
			</h1>
			<preview class="overflow-auto m-4 mx-8">
				<wrapper class="p-4 h-60 w-full md:w-100 md:m-auto overflow-auto">
					<svelte:component this={slide.component} {...slide.props} />
				</wrapper>
			</preview>
		</section>
	</page>
{/if}
