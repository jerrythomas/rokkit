<script>
	import { CodeSnippet } from '@rokkit/markdown'
	// import { snippet } from './snippet'
	import { Tabs } from '@rokkit/core'
	import Preview from '$lib/Preview.svelte'
	// import 'prism-svelte'
	import PageViewer from './PageViewer.svelte'

	export let data

	let fields = { text: 'title' }
	let page = data.pages.length ? data.pages[0] : null
</script>

{#if data.pages.length > 0}
	<h1 class="text-2xl mb-4 text-skin-900">List Component</h1>
	<PageViewer
		items={data.pages}
		{fields}
		bind:value={page}
		class="w-300 h-150 card bg-skin-100 bg-opacity-80 rounded-lg shadow p-8 text-skin-900"
	/>
{/if}
