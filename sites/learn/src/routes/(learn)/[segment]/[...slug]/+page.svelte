<script>
	import { media } from '$lib/media'
	import { ResponsiveGrid } from '@rokkit/elements'

	import Preview from './Preview.svelte'
	import Notes from './Notes.svelte'

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
	let layout = 'two-col' // $derived(site.code === 'hidden' ? 'two-col' : 'three-col')
</script>

<ResponsiveGrid {items} small={false} class="{layout} {size}" bind:value={page} />
<!-- {#if size == 'sm'}
	<Switch options={items} fields={{ text: 'name' }} bind:value={page} class="my-2" />
{/if} -->
