import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'toasts',
	title: 'Toasts',
	description: 'Trigger toast notifications — success, warning, error, and info variants.',
	keywords: ['toast', 'toasts', 'notification', 'notifications', 'alert', 'alerts', 'message', 'snackbar', 'banner'],
	category: 'feedback',
	icon: '報',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_toasts',
		description:
			'Mount a toast/notification demo on the canvas. Use when the user asks about transient notifications, alerts, success/error feedback, or imperative messaging.',
		parameters: {
			position: 'top-right | top-center | top-left | bottom-right | bottom-center | bottom-left'
		}
	},
	inline: { capable: false },
	variants: [
		{ id: 'bottom-right', label: 'Bottom-right stack', mode: 'dynamic' },
		{ id: 'auto-dismiss', label: 'Auto-dismiss after 3s', mode: 'dynamic' }
	],
	api: {
		props: [
			{ name: 'position', type: "'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'", default: "'top-right'", desc: 'Where toasts stack on the screen' },
			{ name: 'duration', type: 'number', default: '4000', desc: 'Auto-dismiss timeout in ms (0 to keep open)' },
			{ name: 'max', type: 'number', default: '5', desc: 'Maximum visible toasts before older ones drop' }
		],
		events: [
			{ name: 'ondismiss', signature: '(toast) => void', desc: 'Fires when a toast is dismissed (manual or auto)' }
		],
		attrs: [
			{ selector: '[data-toasts]', desc: 'Toast stack container (carries data-position)' },
			{ selector: '[data-toast]', desc: 'Individual toast (carries data-kind: success / warning / error / info)' },
			{ selector: '[data-toast-close]', desc: 'Manual dismiss button' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Trigger a toast — imperative API',
			lang: 'svelte',
			code: `<script>
  import { alerts } from '@rokkit/states'
  import { Button, AlertList } from '@rokkit/ui'
</script>

<Button onclick={() => alerts.success('Saved successfully')}>
  Save
</Button>

<AlertList position="top-right" />`
		},
		{
			id: 'kinds',
			title: 'All four kinds',
			lang: 'svelte',
			code: `<Button onclick={() => alerts.info('FYI…')}>Info</Button>
<Button onclick={() => alerts.success('Saved')}>Success</Button>
<Button onclick={() => alerts.warning('Heads up')}>Warning</Button>
<Button onclick={() => alerts.error('Something broke')}>Error</Button>`
		},
		{
			id: 'options',
			title: 'Position + auto-dismiss',
			lang: 'svelte',
			code: `<AlertList
  position="bottom-right"
  duration={3000}
  max={3}
/>`
		}
	]
}

export default meta
