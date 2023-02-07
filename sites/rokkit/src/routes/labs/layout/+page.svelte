<script>
	import { ResponsiveGrid } from '@rokkit/core'
	import { ButtonGroup } from '@rokkit/form'
	import PlaceHolder from '$lib/PlaceHolder.svelte'
	let pages = [{ text: 'AAA' }, { text: 'BBB' }, { text: 'CCC' }]
	let items = [
		{
			component: PlaceHolder,
			name: 'Notes',
			props: {
				items: pages,
				class: 'bg-pink-500 items-center justify-center'
			},
			content: pages[0]
		},
		{
			component: PlaceHolder,
			name: 'Preview',
			props: { items: pages, class: 'bg-sky-500 items-center justify-center' },
			content: pages[1]
		},
		{
			component: PlaceHolder,
			name: 'Code',
			props: {
				class: 'bg-teal-500 items-center justify-center'
			},
			content: pages[2]
		}
	]
	let size = 'sm'
	let page = items[0]
</script>

<ButtonGroup items={['sm', 'md', 'lg']} bind:value={size} class="bg-skin-50" />
<ResponsiveGrid
	bind:items
	small={size == 'sm'}
	class="three-col {size}"
	bind:value={page}
/>
{#if size == 'sm'}
	<ButtonGroup {items} fields={{ text: 'name' }} bind:value={page} />
{/if}
