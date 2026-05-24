import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'stepper',
	title: 'Stepper',
	description:
		'Multi-step progress indicator. Click any completed step to revisit. Use it for sign-up flows, checkouts, or any sequenced task.',
	keywords: [
		'stepper', 'steps', 'wizard', 'checkout', 'flow', 'sign-up', 'signup',
		'onboarding', 'progress', 'progress-bar', 'multi-step', 'multistep',
		'sequence', 'workflow'
	],
	category: 'navigation',
	icon: '段',
	load: () => import('./placeholder.svelte')
}

export default meta
