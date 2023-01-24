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
		class="flex flex-col-reverse overflow-auto md:grid md:grid-cols-4 w-full h-full border-t border-t-skin-200 {skin}"
	>
		<aside
			class="flex flex-col md:col-span-2 border-r border-r-skin-200 overflow-auto"
		>
			<notes class="prose prose-sm w-full overflow-scroll">
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

		<section class="flex flex-col md:col-span-2 ">
			<h1
				class="flex w-full leading-loose items-center text-xl md:text-3xl px-6 bg-skin-300 bg-opacity-50"
			>
				{name}
			</h1>
			<preview class="overflow-auto m-3 lg:m-12">
				<wrapper class="h-60 w-full md:w-100 self-center overflow-auto">
					<svelte:component this={slide.component} {...slide.props} />
				</wrapper>
			</preview>
		</section>
	</page>
{/if}
