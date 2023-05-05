<script>
	import { setContext, getContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { ResponsiveGrid } from '@rokkit/core'
	import { ButtonGroup } from '@rokkit/form'

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
	let ready = false

	async function loadComponent(tutorial) {
		ready = false

		if (tutorial) console.log(tutorial.src.files)
		story.set({
			preview: tutorial.src.preview,
			files: tutorial.src.files,
			readme: tutorial.readme,
			crumbs: tutorial.crumbs,
			previous: tutorial.previous,
			next: tutorial.next
		})
		ready = true
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
