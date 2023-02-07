<script>
	import { Tabs, PageNavigator, DropDown } from '@rokkit/core'
	import MultiFileViewer from './MultiFileViewer.svelte'
	import { getContext } from 'svelte'
	import { ResponsiveGrid } from '@rokkit/core'
	import Notes from '../routes/(guide)/guide/[component]/Notes.svelte'
	import Preview from '../routes/(guide)/guide/[component]/Preview.svelte'

	const media = getContext('media')

	/** @type {Object<string, any>} */
	export let metadata
	/** @type {string} */
	export let name
	/** @type {Array<import('./types').StoryPage>} */
	export let pages
	/** @type {import('$lib/types').StoryPage} */
	// let slide = pages[0]
	let items = [
		{
			name: 'Notes',
			component: Notes,
			props: { pages },
			content: pages[0]
		},
		{
			name: 'Preview',
			component: Preview
		},
		{
			name: 'Code',
			component: MultiFileViewer
		}
	]
	let currentFile
	/**
	 *
	 * @param {Array<import('$lib/types').StoryPage>} pages
	 */
	function handlePathChanges(pages) {
		const matched = pages.find((x) => x === items[0].content)
		if (!matched) {
			items[0].content = pages[0]
		}
		items[0].props = { pages }
		// items[0].content = slide
	}
	// function handleSlideChanges(slide) {
	// 	const matched = slide.files.find((x) => x === currentFile)
	// 	if (!matched) {
	// 		currentFile = slide.files[0]
	// 	}
	// }

	// $: handlePathChanges(pages)
	// $: handleSlideChanges(slide)
	$: skin = metadata?.skin ?? ''
	$: navigator =
		$media.small || items[0].content.files.length > 4 ? DropDown : Tabs
	$: size = $media.large ? 'lg' : $media.medium ? 'md' : 'sm'
</script>

<!-- {#if items[0].content} -->
<ResponsiveGrid {items} small={$media.small} class="three-col {size}" />
<!-- <page
		class="grid w-full h-full {skin}"
		class:small={$media.small}
		class:medium={$media.medium}
		class:large={$media.large}
	>
		<aside
			class="flex flex-col w-full pb-12 border-r border-r-skin-200 relative overflow-hidden"
			class:active={$media.small && active == 'notes'}
		>
			<notes class="prose w-full overflow-auto">
				<svelte:component this={slide.notes} />
			</notes>
			<PageNavigator
				items={pages}
				fields={{ text: 'title' }}
				bind:value={slide}
				class="min-h-12 bg-skin-400 absolute bottom-0"
			/>
		</aside>
		<section
			class="flex flex-col"
			class:active={$media.small && active == 'preview'}
		>
			<span class="flex flex-col">
				<h1
					class="flex w-full items-center text-2xl px-4 min-h-12 max-h-12 bg-skin-300 bg-opacity-50 shadow"
				>
					{metadata?.name ?? name}
				</h1>
				<preview class="overflow-hidden m-4">
					<wrapper
						class="min-h-30 max-h-41 md:max-h-80 w-full md:w-70 lg:w-100 m-auto overflow-auto"
					>
						<svelte:component this={slide.preview} />
					</wrapper>
				</preview>
			</span>
		</section>
		<content
			class="flex flex-col overflow-hidden"
			class:active={$media.small && active == 'files'}
		>
			<MultiFileViewer
				{navigator}
				items={slide.files}
				fields={{ text: 'file' }}
				class="file-viewer"
				bind:value={currentFile}
			/>
		</content>
		{#if $media.small}
			<footer
				class="flex flex-row justify-center items-center gap-2 bg-skin-100"
			>
				<button
					on:click={() => (active = 'notes')}
					class:active={active == 'notes'}>notes</button
				>
				<button
					on:click={() => (active = 'preview')}
					class:active={active == 'preview'}>preview</button
				>
				<button
					on:click={() => (active = 'files')}
					class:active={active == 'files'}>source</button
				>
			</footer>
		{/if}
	</page> -->
<!-- {/if} -->

<!-- <style>
	button {
		@apply rounded-md px-3 py-2 leading-loose uppercase;
	}
	button.active {
		@apply text-secondary-400;
	}
	.small {
		grid-template-rows: auto 3rem;
		grid-template-columns: 1fr;
		grid-template-areas:
			'a'
			'f';
	}
	.small > footer {
		grid-area: f;
	}
	.small > *:not(footer):not(.active) {
		display: none;
	}
	.small > .active {
		grid-area: a;
	}
	.medium {
		grid-template-columns: 25rem auto;
		grid-template-rows: 1fr 1fr;
		grid-template-areas:
			'a b'
			'a c';
	}
	.large {
		grid-template-columns: 25rem 2fr 3fr;
		grid-template-rows: auto;
		grid-template-areas: 'a b c';
	}
	:not(.small) footer {
		display: none;
	}
	:not(.small) aside {
		grid-area: a;
	}
	:not(.small) section {
		grid-area: b;
	}
	:not(.small) content {
		grid-area: c;
	}
</style> -->
