<script>
	import { Tree } from '@rokkit/core'
	import { CodeSnippet } from '@rokkit/markdown'

	// import MultiFileViewer from '$lib/MultiFileViewer.svelte'
	// import { getContext } from 'svelte'
	export let files = []
	let currentFile
	let code
	let language
	let fields = { text: 'name', icon: 'type', children: 'children' }
	let icons = {
		opened: 'i-rokkit:folder-opened',
		closed: 'i-rokkit:folder-closed'
	}
	$: currentFile = files[0]
	$: if (currentFile && currentFile.content) {
		code = currentFile.content
		language = currentFile.type
	}
	// const story = getContext('story')
</script>

<section class="flex flex-col w-full h-full overflow-hidden">
	<app-source class="flex w-full">
		<aside class="flex flex-col bg-skin-inset w-60 h-full">
			<Tree
				items={files}
				{fields}
				linesVisible={true}
				{icons}
				root="src"
				bind:value={currentFile}
				class="folder-tree"
			/>
		</aside>
		{#if code}
			<CodeSnippet {code} {language} />
		{/if}
		<!-- <div class="flex">{currentFile.content}</div> -->
	</app-source>
</section>
