<script>
	import { setContext, getContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { ResponsiveGrid } from '@rokkit/core'
	import { ButtonGroup } from '@rokkit/form'
	import GraphPaper from '$lib/GraphPaper.svelte'
	import MultiFileViewer from '$lib/MultiFileViewer.svelte'

	import Code from './Code.svelte'
	import Notes from './Notes.svelte'
	import Preview from './Preview.svelte'

	const story = writable({})
	const media = getContext('media')

	setContext('story', story)
	export let data
	let mode = 'single'

	let items = [
		{
			component: Notes,
			name: 'Notes',
			props: {
				class: 'items-center justify-center'
			}
		},
		{
			component: Preview,
			name: 'Preview',
			props: {
				class: 'items-center justify-center'
			}
		},
		{
			component: Code,
			name: 'Code',
			props: {
				class: 'items-center justify-center'
			}
		}
	]
	let size = 'md'
	let page = items[0]

	$: story.set({ ...data.story, current: data.story.pages[0] })
	$: size = $media.large ? 'lg' : $media.medium ? 'md' : 'sm'
</script>

{#if mode == 'single'}
	<section class="flex flex-col w-full h-full gap-5 py-4 overflow-scroll">
		{#each data.story.pages as { notes, preview, files }}
			<notes class="markdown-body px-8 py-2 w-full">
				<svelte:component this={notes} />
			</notes>
			<GraphPaper class="{data.story.skin} min-h-100 mx-8">
				<svelte:component this={preview} />
			</GraphPaper>
			<MultiFileViewer
				items={files}
				fields={{ text: 'file' }}
				class="min-h-100 file-viewer mx-8 h-content"
				value={files[0]}
			/>
		{/each}
	</section>
{:else}
	<ResponsiveGrid
		{items}
		small={size == 'sm'}
		class="three-col {size}"
		bind:value={page}
	/>
	{#if size == 'sm'}
		<ButtonGroup {items} fields={{ text: 'name' }} bind:value={page} />
	{/if}
{/if}
