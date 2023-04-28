<script>
	import { setContext, getContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { ResponsiveGrid } from '@rokkit/core'
	import { ButtonGroup } from '@rokkit/form'
	// import { Tree } from '@rokkit/core'
	// import { CodeSnippet } from '@rokkit/markdown'
	import Notes from './Notes.svelte'
	import Code from './Code.svelte'
	import Preview from './Preview.svelte'

	const story = writable({})
	const media = getContext('media')
	setContext('tutorial', story)

	let items = [
		{
			component: Notes,
			name: 'Notes'
		},
		{
			component: Preview,
			name: 'Preview'
		},
		{
			component: Code,
			name: 'Code'
		}
	]
	let page = items[0]
	let component
	let preview
	let ready = false

	async function loadComponent(tutorial) {
		ready = false
		if (!tutorial) {
			console.error(`No tutorial found for ${path}`)
		}

		try {
			component = (await import(/* @vite-ignore */ tutorial.readme)).default
			preview = (await import(/* @vite-ignore */ tutorial.after.preview))
				.default
			// files = tutorial.after.files
			story.set({
				preview,
				files: tutorial.after.files,
				readme: component,
				crumbs: tutorial.crumbs
			})
			ready = true
		} catch (error) {
			console.error(error)
		}
	}
	let size = 'md'
	export let data

	$: loadComponent(data.tutorial)
	$: size = $media.large ? 'lg' : $media.medium ? 'md' : 'sm'
</script>

<ResponsiveGrid
	{items}
	small={size == 'sm'}
	class="three-col {size}"
	bind:value={page}
/>
{#if size == 'sm'}
	<ButtonGroup {items} fields={{ text: 'name' }} bind:value={page} />
{/if}
