<script>
	import { getContext } from 'svelte'
	import { media } from '$lib/media'
	import { ResponsiveGrid, Switch } from '@rokkit/ui'
	import Preview from './Preview.svelte'
	import Notes from './Notes.svelte'

	let site = getContext('site')()

	let { data } = $props()
	let size = $derived(media.large.current ? 'lg' : media.medium.current ? 'md' : 'sm')
	let items = $derived([
		{
			component: Notes,
			name: 'Notes',
			props: {
				content: data.tutorial.readme,
				previous: data.tutorial.previous,
				next: data.tutorial.next,
				crumbs: data.tutorial.crumbs
			}
		},
		{
			component: Preview,
			name: 'Preview',
			props: {
				content: data.tutorial.src.preview
			}
		},
		{
			component: Notes,
			name: 'Code'
		}
	])
	let page = $state(() => items[0])
	let layout = $derived(site.code === 'visible' ? 'two-col' : 'three-col')
	let small = $derived(size === 'sm')
</script>

<ResponsiveGrid {items} class="{layout} {size}" {small} bind:value={page} />
{#if size == 'sm'}
	<span class=" absolute bottom-0 flex w-full flex-row items-center">
		<Switch options={items} fields={{ text: 'name' }} bind:value={page} />
	</span>
{/if}
