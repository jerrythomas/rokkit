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
	inline: { capable: false }
}

export default meta
