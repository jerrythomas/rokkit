<script>
	import { setContext, getContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { ResponsiveGrid, Switch } from '@rokkit/ui'

	import Notes from './Notes.svelte'
	import Code from './Code.svelte'
	import Preview from './Preview.svelte'

	const story = writable({})
	const media = getContext('media')
	const site = getContext('site')
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

	async function loadComponent(tutorial) {
		story.set({
			preview: tutorial.src.preview,
			files: tutorial.src.files,
			readme: tutorial.readme,
			crumbs: tutorial.crumbs,
			previous: tutorial.previous,
			next: tutorial.next
		})
	}
	let size = 'md'
	export let data
	// $: console.log($site)
	$: loadComponent(data.tutorial)
	$: size = $media.large ? 'lg' : $media.medium ? 'md' : 'sm'
	$: layout = $site.code === 'hidden' ? 'two-col' : 'three-col'
</script>

<ResponsiveGrid {items} small={size == 'sm'} class="{layout} {size}" bind:value={page} />
{#if size == 'sm'}
	<Switch options={items} fields={{ text: 'name' }} bind:value={page} class="my-2" />
{/if}
