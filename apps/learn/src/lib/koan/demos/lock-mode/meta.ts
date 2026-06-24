import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'

const meta: DemoMeta = {
	id: 'lock-mode',
	title: 'LockMode',
	description: 'Pin a subtree to a fixed color mode (always dark or always light) regardless of the document mode.',
	keywords: [
		'lock-mode', 'lockmode', 'dark', 'light', 'color-mode', 'theme', 'pin',
		'region', 'forced-colors', 'mode', 'dual-mode', 'contrast'
	],
	category: 'theming',
	icon: 'i-mdi:theme-light-dark',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_lock_mode',
		description: 'Mount a LockMode demo showing always-dark and always-light regions side by side.',
		parameters: {}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'mode', type: "'dark' | 'light'", desc: 'The color mode to lock this subtree to. Pinned at mount.' },
			{ name: 'class', type: 'string', desc: 'Optional CSS class forwarded to the wrapper div.' },
			{ name: 'children', type: 'Snippet', desc: 'Content rendered inside the locked region.' }
		],
		events: [],
		attrs: [
			{ selector: '[data-mode]', desc: 'Static attribute on the wrapper div matching the locked mode. The lockMode action keeps this set.' },
			{ selector: '[data-style], [data-skin], [data-density]', desc: 'Mirrored from document root by MutationObserver so @rokkit/themes component CSS keys work inside the region.' }
		]
	},
	snippets: [
		{
			id: 'dark',
			title: 'Always-dark region',
			lang: 'svelte',
			code: `<LockMode mode="dark">
  <Card>Always dark surface</Card>
</LockMode>`
		},
		{
			id: 'light',
			title: 'Always-light region',
			lang: 'svelte',
			code: `<LockMode mode="light">
  <Card>Always light surface</Card>
</LockMode>`
		},
		{
			id: 'side-by-side',
			title: 'Side-by-side comparison',
			lang: 'svelte',
			code: `<div class="row">
  <LockMode mode="dark">
    <Card>Dark region</Card>
  </LockMode>
  <LockMode mode="light">
    <Card>Light region</Card>
  </LockMode>
</div>`
		}
	],
	docs
}

export default meta
