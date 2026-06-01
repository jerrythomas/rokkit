import type { DemoMeta } from '../../types'
import { badgeDocs } from './docs'

const meta: DemoMeta = {
	id: 'badge',
	title: 'Badge',
	description: 'Small notification count or status dot overlaid on icons, avatars, list items.',
	keywords: ['badge', 'badges', 'notification', 'count', 'counter', 'dot', 'indicator', 'unread'],
	category: 'feedback',
	icon: '号',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_badge',
		description: 'Mount a Badge gallery — counts, dot mode, and badged buttons.',
		parameters: { count: 'numeric value', variant: 'default | primary | success | warning | error' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'count', type: 'number', desc: 'Numeric count to display' },
			{ name: 'max', type: 'number', default: '99', desc: 'Maximum count before showing `max+`' },
			{ name: 'variant', type: "'default' | 'primary' | 'success' | 'warning' | 'error'", default: "'default'", desc: 'Visual variant' },
			{ name: 'dot', type: 'boolean', default: 'false', desc: 'Small dot mode (omits count)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		attrs: [
			{ selector: '[data-badge]', desc: 'Root container (carries data-variant)' },
			{ selector: '[data-badge-dot]', desc: 'Dot-mode marker' }
		]
	},
	snippets: [
		{ id: 'count', title: 'Numeric count', lang: 'svelte',
			code: `<Badge count={3} variant="error">\n  <Button icon="i-mdi:bell" aria-label="Notifications" />\n</Badge>` },
		{ id: 'dot', title: 'Status dot', lang: 'svelte',
			code: `<Badge dot variant="success" />` },
		{ id: 'overflow', title: 'Overflow with max', lang: 'svelte',
			code: `<Badge count={150} max={99} />`}
	],
	docs: badgeDocs
}

export default meta
