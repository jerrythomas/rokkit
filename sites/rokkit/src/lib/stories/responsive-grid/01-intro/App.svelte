<script>
	import { ResponsiveGrid } from '@rokkit/core'
	import { ButtonGroup } from '@rokkit/form'
	import PlaceHolder from './PlaceHolder.svelte'

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
</script>

<ButtonGroup items={['sm', 'md', 'lg']} bind:value={size} />
<ResponsiveGrid {items} small={size == 'sm'} class="three-col {size}" />
{#if size == 'sm'}
	<ButtonGroup {items} fields={{ text: 'name' }} />
{/if}
