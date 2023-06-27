<script>
	import { ResponsiveGrid } from '@rokkit/core'
	import { ButtonGroup } from '@rokkit/form'
	import PlaceHolder from './PlaceHolder.svelte'
	import './style.css'

	let items = [
		{
			component: PlaceHolder,
			name: 'Page 1',
			props: {
				content: 'AAA',
				class: 'bg-pink-500 items-center justify-center'
			}
		},
		{
			component: PlaceHolder,
			name: 'Page 2',
			props: { content: 'BBB', class: 'bg-sky-500 items-center justify-center' }
		},
		{
			component: PlaceHolder,
			name: 'Page 3',
			props: {
				content: 'CCC',
				class: 'bg-teal-500 items-center justify-center'
			}
		}
	]
	let size = 'sm'
	let page = items[0]
</script>

<ButtonGroup items={['sm', 'md', 'lg']} bind:value={size} />
<ResponsiveGrid
	{items}
	small={size == 'sm'}
	class="demo-col {size}"
	bind:value={page}
/>
{#if size == 'sm'}
	<ButtonGroup {items} fields={{ text: 'name' }} bind:value={page} />
{/if}
