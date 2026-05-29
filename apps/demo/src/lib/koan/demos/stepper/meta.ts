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
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_stepper',
		description:
			'Mount a multi-step Stepper. Use for sequenced flows — checkouts, sign-ups, onboarding wizards, anything with a clear ordered progression.',
		parameters: {
			steps: 'Array<{ label: string, completed?: boolean }>',
			current: 'index of the active step'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'vertical', label: 'Vertical orientation', mode: 'dynamic', props: { orientation: 'vertical' } },
		{ id: 'with-content', label: 'With per-step content', mode: 'dynamic' }
	],
	props: {
		orientation: {
			type: 'enum',
			options: ['horizontal', 'vertical'],
			default: 'horizontal',
			desc: 'Layout axis for the step indicator'
		}
	}
}

export default meta
