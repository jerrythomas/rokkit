import type { DemoMeta } from '../../types'
import { cardDocs } from './docs'

const meta: DemoMeta = {
	id: 'card',
	title: 'Card',
	description: 'Container with header / body / footer zones — plain, link, or interactive variant.',
	keywords: [
		'card', 'panel', 'tile', 'container', 'surface',
		'cta-card', 'product-card', 'media-card'
	],
	category: 'layout',
	icon: '匣',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_card',
		description: 'Mount a Card gallery on the canvas.',
		parameters: { variant: 'default | primary | secondary | tertiary' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'href', type: 'string', desc: 'When set, renders as an `<a>` instead of a `<div>`' },
			{ name: 'onclick', type: '() => void', desc: 'Click handler — renders as a `<button>` when set (and `href` is unset)' },
			{ name: 'variant', type: "'default' | 'primary' | 'secondary' | 'tertiary'", default: "'default'", desc: 'Colour palette (drives `data-variant`)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onclick', signature: '() => void', desc: 'Fires on interactive variant click (only when no href)' }
		],
		attrs: [
			{ selector: '[data-card]', desc: 'Root container (carries data-variant; data-card-interactive when clickable)' },
			{ selector: '[data-card-header]', desc: 'Header zone' },
			{ selector: '[data-card-body]', desc: 'Body content' },
			{ selector: '[data-card-footer]', desc: 'Footer zone' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Plain, link, and interactive',
			lang: 'svelte',
			code: `<Card>
  <h3>Simple Card</h3>
  <p>Basic body content.</p>
</Card>

<Card href="/dashboard">
  <h3>Linked Card</h3>
  <p>Renders as an anchor.</p>
</Card>

<Card onclick={() => console.log('clicked')}>
  <h3>Interactive Card</h3>
  <p>Renders as a button.</p>
</Card>`
		},
		{
			id: 'snippets',
			title: 'Header + footer snippets',
			lang: 'svelte',
			code: `<Card>
  {#snippet header()}
    <h3>Profile</h3>
  {/snippet}

  <p>Body content goes here.</p>

  {#snippet footer()}
    <button>Edit</button>
  {/snippet}
</Card>`
		},
		{
			id: 'variants',
			title: 'Variant palette',
			lang: 'svelte',
			code: `<Card variant="primary"><h3>Primary</h3></Card>
<Card variant="secondary"><h3>Secondary</h3></Card>
<Card variant="tertiary"><h3>Tertiary</h3></Card>`
		}
	],
	docs: cardDocs
}

export default meta
