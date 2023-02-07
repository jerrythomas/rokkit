<script>
	import { setContext, getContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { ResponsiveGrid } from '@rokkit/core'
	import { ButtonGroup } from '@rokkit/form'

	import Code from './Code.svelte'
	import Preview from './Preview.svelte'
	import Notes from './Notes.svelte'

	const story = writable({})
	const media = getContext('media')

	setContext('story', story)
	export let data

	let items = [
		{
			component: Notes,
			name: 'Notes',
			props: {
				class: 'bg-pink-500 items-center justify-center'
			}
		},
		{
			component: Preview,
			name: 'Preview',
			props: {
				class: 'bg-sky-500 items-center justify-center'
			}
		},
		{
			component: Code,
			name: 'Code',
			props: {
				class: 'bg-teal-500 items-center justify-center'
			}
		}
	]
	let size = 'md'
	let page = items[1]

	$: story.set({ ...data.story, current: data.story.pages[0] })
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
