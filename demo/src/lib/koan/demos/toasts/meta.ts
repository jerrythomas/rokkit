import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'toasts',
	title: 'Toasts',
	description: 'Trigger toast notifications — success, warning, error, and info variants.',
	keywords: ['toast', 'toasts', 'notification', 'notifications', 'alert', 'alerts', 'message', 'snackbar', 'banner'],
	category: 'feedback',
	icon: '報',
	load: () => import('./index.svelte')
}

export default meta
