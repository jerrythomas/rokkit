<script>
	import { onMount } from 'svelte'
	import { Tree } from '@rokkit/core'
	import { CodeSnippet } from '@rokkit/markdown'
	import Notes from './Notes.svelte'
	import Code from './Code.svelte'
	let component
	let preview
	let ready = false
	let currentFile
	let files = []

	async function loadComponent(tutorial) {
		ready = false
		if (!tutorial) {
			console.error(`No tutorial found for ${path}`)
		}

		try {
			component = (await import(/* @vite-ignore */ tutorial.readme)).default
			preview = (await import(/* @vite-ignore */ tutorial.after.preview))
				.default
			files = tutorial.after.files

			ready = true
		} catch (error) {
			console.error(error)
		}
	}
	export let data

	// let code
	// let language

	// $: if (currentFile && currentFile.content) {
	// 	code = currentFile.content
	// 	language = currentFile.type
	// }

	$: loadComponent(data.tutorial)
</script>

{#if ready}
	<split-view class="flex w-full h-full">
		<Notes readmeFile={data.tutorial.readme} crumbs={data.tutorial.crumbs} />
		<section class="grid grid-rows-2 w-full h-full">
			<div class="flex flex-col p-8 gap-4">
				<svelte:component this={preview} />
			</div>
			<Code {files} />
			<!-- <app-source class="flex w-full">
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
				 <div class="flex">{currentFile.content}</div>
			</app-source> -->
		</section>
	</split-view>
{:else}
	<p>Loading component...</p>
{/if}
