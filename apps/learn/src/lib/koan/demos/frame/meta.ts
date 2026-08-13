import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'frame',
	title: 'Frame',
	description:
		'Generic header / body / footer container — the canonical card-shaped UI block primitive.',
	keywords: ['frame', 'card', 'container', 'header', 'footer', 'panel', 'surface', 'layout'],
	category: 'layout',
	icon: '框',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_frame',
		description: 'Mount a Frame header/body/footer container demo on the canvas.',
		parameters: { flush: 'boolean — remove body padding so the inner artifact controls its own' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'header', type: 'Snippet', desc: 'Top slot — title, action chips, status badges' },
			{ name: 'children', type: 'Snippet', desc: 'Main body content' },
			{
				name: 'footer',
				type: 'Snippet',
				desc: 'Bottom slot — metadata, actions, secondary controls'
			},
			{
				name: 'flush',
				type: 'boolean',
				default: 'false',
				desc: 'Zero body padding so the inner artifact (chart, <pre>, table) controls its own'
			}
		],
		events: [],
		attrs: [
			{ selector: '[data-frame]', desc: 'Root container' },
			{
				selector: '[data-frame-header]',
				desc: 'Header wrapper (present only when header snippet given)'
			},
			{
				selector: '[data-frame-body]',
				desc: 'Body wrapper — carries data-flush when flush is set'
			},
			{
				selector: '[data-frame-footer]',
				desc: 'Footer wrapper (present only when footer snippet given)'
			}
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Header + body + footer',
			lang: 'svelte',
			code: `<Frame>
  {#snippet header()}
    <strong>Deployment</strong>
  {/snippet}

  <p>Body content sits between the header and footer zones.</p>

  {#snippet footer()}
    <button type="button">Retry</button>
  {/snippet}
</Frame>`
		},
		{
			id: 'body-only',
			title: 'Body only',
			lang: 'svelte',
			code: `<Frame>
  <p>A Frame is happy with just a body — header and footer are optional.</p>
</Frame>`
		},
		{
			id: 'flush',
			title: 'Flush body for a full-bleed artifact',
			lang: 'svelte',
			code: `<Frame flush>
  {#snippet header()}
    <strong>chart.svelte</strong>
  {/snippet}

  <pre>const total = rows.reduce(sum, 0)</pre>
</Frame>`
		}
	],
	docs
}

export default meta
