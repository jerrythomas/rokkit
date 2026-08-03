import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'nav-content',
	title: 'Nav + Content',
	description:
		'Two-pane split layout — a fixed-size nav rail beside a flexible content pane, horizontal or vertical.',
	keywords: ['nav', 'content', 'sidebar', 'rail', 'split', 'layout', 'master-detail', 'shell'],
	category: 'navigation',
	icon: '欄',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_nav_content',
		description: 'Mount a Nav + Content split-layout demo on the canvas.',
		parameters: {
			orientation: 'horizontal | vertical',
			navSize: 'CSS length — nav panel width (horizontal) or height (vertical), e.g. 280px',
			collapsible: 'boolean — collapse the nav panel on small screens'
		}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{
				name: 'orientation',
				type: "'horizontal' | 'vertical'",
				default: "'horizontal'",
				desc: 'Nav beside the content (horizontal) or above it (vertical)'
			},
			{
				name: 'navSize',
				type: 'string',
				default: "'280px'",
				desc: 'Nav panel width (horizontal) or height (vertical) — CSS length; sets --nav-size'
			},
			{
				name: 'collapsible',
				type: 'boolean',
				default: 'true',
				desc: 'Collapse the nav panel on small screens'
			},
			{ name: 'nav', type: 'Snippet', desc: 'Nav panel content (required)' },
			{ name: 'content', type: 'Snippet', desc: 'Content panel content (required)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Additional CSS class' }
		],
		events: [],
		attrs: [
			{
				selector: '[data-nav-content]',
				desc: 'Root — carries data-orientation, data-collapsible; reads --nav-size'
			},
			{ selector: '[data-nav-content-nav]', desc: 'Nav panel wrapper' },
			{ selector: '[data-nav-content-main]', desc: 'Content panel wrapper' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Sidebar + content',
			lang: 'svelte',
			code: `<NavContent navSize="240px">
  {#snippet nav()}
    <nav>
      <a href="#overview">Overview</a>
      <a href="#billing">Billing</a>
    </nav>
  {/snippet}

  {#snippet content()}
    <article>Selected page renders here.</article>
  {/snippet}
</NavContent>`
		},
		{
			id: 'vertical',
			title: 'Vertical — nav on top',
			lang: 'svelte',
			code: `<NavContent orientation="vertical" navSize="56px">
  {#snippet nav()}
    <div class="tabs">Tabs / toolbar row</div>
  {/snippet}

  {#snippet content()}
    <section>Panel body</section>
  {/snippet}
</NavContent>`
		},
		{
			id: 'fixed',
			title: 'Non-collapsible rail',
			lang: 'svelte',
			code: `<NavContent navSize="220px" collapsible={false}>
  {#snippet nav()}
    <nav>Always-visible rail</nav>
  {/snippet}

  {#snippet content()}
    <article>Content</article>
  {/snippet}
</NavContent>`
		}
	],
	docs
}

export default meta
