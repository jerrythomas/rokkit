import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'message',
	title: 'Message',
	description: 'Inline alert message — info / success / warning / error, optional dismiss, optional auto-timeout.',
	keywords: ['message', 'messages', 'alert', 'banner', 'inline', 'notice', 'feedback'],
	category: 'feedback',
	icon: '言',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_message',
		description: 'Mount a Message gallery — four severity kinds, dismissible, rich content.',
		parameters: { type: 'info | success | warning | error', text: 'message body' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'type', type: "'info' | 'success' | 'warning' | 'error'", default: "'error'", desc: 'Severity kind — drives colour and icon' },
			{ name: 'text', type: 'string', desc: 'Shorthand text content (children takes precedence)' },
			{ name: 'icons', type: '{ info?, success?, warning?, error? }', desc: 'Override per-type icon classes' },
			{ name: 'dismissible', type: 'boolean', default: 'false', desc: 'Show close button' },
			{ name: 'timeout', type: 'number', default: '4000 | 0', desc: 'Auto-dismiss ms; 0 disables. Defaults to 0 when dismissible.' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'ondismiss', signature: '() => void', desc: 'Fires on close-button click or timeout' }
		],
		attrs: [
			{ selector: '[data-message]', desc: 'Root container (carries data-type)' },
			{ selector: '[data-message-icon]', desc: 'Severity icon span' },
			{ selector: '[data-message-body]', desc: 'Text content area' },
			{ selector: '[data-message-close]', desc: 'Dismiss button (when dismissible)' }
		]
	},
	snippets: [
		{ id: 'intro', title: 'Basic', lang: 'svelte', code: `<Message type="success" text="Saved." />` },
		{ id: 'dismissible', title: 'Dismissible', lang: 'svelte',
			code: `<Message type="info" text="Heads up." dismissible ondismiss={() => ...} />` },
		{ id: 'rich', title: 'Rich content + actions', lang: 'svelte',
			code: `<Message type="warning">\n  <strong>Heads up.</strong> Migration at 2 AM UTC.\n  {#snippet actions()}\n    <Button>Retry</Button>\n  {/snippet}\n</Message>` }
	],
	docs
}

export default meta
