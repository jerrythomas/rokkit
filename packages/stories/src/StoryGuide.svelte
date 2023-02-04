<script>
	import { Tabs, PageNavigator, DropDown } from '@rokkit/core'
	import MultiFileViewer from './MultiFileViewer.svelte'
	// import { CodeSnippet } from '@rokkit/markdown'
	// import { snippet } from '$lib/snippet'

	/** @type {Object<string, any>} */
	export let metadata
	/** @type {string} */
	export let name
	/** @type {Array<import('./types').StoryPage>} */
	export let pages

	// export let FileManager = Tabs
	/** @type {import('$lib/types').TutorialSlide} */
	let slide = pages[0]
	let currentFile = slide.files[0]
	/**
	 *
	 * @param {Array<import('$lib/types').TutorialSlide>} pages
	 */
	function handlePathChanges(pages) {
		const matched = pages.find((x) => x === slide)
		if (!matched) {
			slide = pages[0]
		}
	}
	$: handlePathChanges(pages)
	// $: code = slide ? snippet(name, slide.props, slide.snippet) : null
</script>

{#if slide}
	<page
		class="flex flex-col-reverse overflow-auto w-full h-full border-t border-t-skin-200 {skin} md:grid md:grid-cols-2"
	>
		<aside
			class="flex flex-col pb-12 border-r border-r-skin-200 relative overflow-hidden"
		>
			<notes class="prose w-full overflow-auto">
				<svelte:component this={slide.notes} />
			</notes>
			<PageNavigator
				items={pages}
				fields={{ text: 'title' }}
				bind:value={slide}
				class="min-h-12 bg-skin-400  absolute bottom-0"
			/>
		</aside>
		<section class="flex flex-col ">
			<h1
				class="flex w-full items-center text-2xl px-4 min-h-12 max-h-12 bg-skin-300 bg-opacity-50 shadow"
			>
				&lt;{name}/&gt;
			</h1>
			<preview class="overflow-hidden m-4">
				<wrapper
					class="min-h-30 max-h-41 md:max-h-80 w-full md:w-70 lg:w-100 m-auto overflow-auto"
				>
					<svelte:component this={slide.component} />
				</wrapper>
			</preview>
		</section>
		<MultiFileViewer items={slide.files} fields={{ text: 'file' }} />
		<!-- <section class="flex flex-col w-full h-full"> -->
		<!-- <nav class="w-full h-12 items-center">
				<svelte:component
					this={FileManager}
					items={slide.files}
					fields={{ text: 'file' }}
					bind:value={currentFile}
				/>
			</nav>

			<CodeSnippet
				code={currentFile.code}
				language={currentFile.files.split('.')[2]}
			/> -->
		<!-- </section> -->
	</page>
{/if}
