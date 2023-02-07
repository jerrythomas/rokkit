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
		},
		{
			component: PlaceHolder,
			name: 'Page 4',
			props: {
				content: 'Page 4',
				class: 'bg-yellow-500 items-center justify-center'
			}
		}
	]
	let size = 'sm'
</script>

<ButtonGroup items={['sm', 'md', 'lg']} bind:value={size} />
<ResponsiveGrid {items} small={size == 'sm'} class="four-col {size}" />
{#if size == 'sm'}
	<ButtonGroup {items} fields={{ text: 'name' }} />
{/if}

<style>
	:global(.four-col) {
		@apply grid w-full h-full;
	}
	:global(.four-col.md) {
		@apply grid-cols-4;
		@apply grid-rows-4;
		grid-template-areas:
			'c-1 c-2'
			'c-3 c-4';
	}

	:global(.four-col.md > .col-1) {
		grid-area: c-1;
	}
	:global(.four-col.md > .col-2) {
		grid-area: c-2;
	}
	:global(.four-col.md > .col-3) {
		grid-area: c-3;
	}
	:global(.four-col.md > .col-4) {
		grid-area: c-4;
	}
	:global(.four-col.lg) {
		@apply grid-cols-4;
	}
</style>
