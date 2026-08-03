import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'responsive-grid',
	title: 'Responsive Grid',
	description:
		'Auto-fit CSS grid that reflows columns to fit — driven by a minimum column width, a gap, and an optional column cap.',
	keywords: ['grid', 'responsive', 'layout', 'auto-fit', 'columns', 'reflow', 'cards', 'gallery'],
	category: 'layout',
	icon: '格',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_responsive_grid',
		description: 'Mount a Responsive Grid demo on the canvas.',
		parameters: {
			minWidth: 'CSS length — minimum column width before wrapping (e.g. 240px)',
			gap: 'CSS length — gap between cells (e.g. 1rem)',
			maxCols: 'number — optional cap on the column count'
		}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{
				name: 'minWidth',
				type: 'string',
				default: "'240px'",
				desc: 'Minimum column width — CSS length; sets --grid-min-width'
			},
			{
				name: 'gap',
				type: 'string',
				default: "'1rem'",
				desc: 'Gap between cells — CSS length; sets --grid-gap'
			},
			{
				name: 'maxCols',
				type: 'number',
				desc: 'Optional maximum column count; sets --grid-max-cols'
			},
			{ name: 'children', type: 'Snippet', desc: 'Grid cells' },
			{ name: 'class', type: 'string', default: "''", desc: 'Additional CSS class' }
		],
		events: [],
		attrs: [
			{
				selector: '[data-responsive-grid]',
				desc: 'Root grid container — reads --grid-min-width, --grid-gap and --grid-max-cols'
			}
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Auto-fit card grid',
			lang: 'svelte',
			code: `<ResponsiveGrid minWidth="220px" gap="1rem">
  <div data-card>One</div>
  <div data-card>Two</div>
  <div data-card>Three</div>
  <div data-card>Four</div>
</ResponsiveGrid>`
		},
		{
			id: 'capped',
			title: 'Capped at three columns',
			lang: 'svelte',
			code: `<ResponsiveGrid minWidth="180px" gap="0.75rem" maxCols={3}>
  {#each items as item (item.id)}
    <article data-card>{item.title}</article>
  {/each}
</ResponsiveGrid>`
		},
		{
			id: 'dense',
			title: 'Dense gallery',
			lang: 'svelte',
			code: `<ResponsiveGrid minWidth="120px" gap="0.5rem">
  {#each photos as photo (photo.id)}
    <img src={photo.url} alt={photo.alt} />
  {/each}
</ResponsiveGrid>`
		}
	],
	docs
}

export default meta
