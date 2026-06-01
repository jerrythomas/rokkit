import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
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
	},
	api: {
		props: [
			{ name: 'steps', type: 'StepDef[]', default: '[]', desc: 'Array of step objects' },
			{ name: 'current', type: 'number', default: '0', desc: 'Active step index', bindable: true },
			{ name: 'currentStage', type: 'number', default: '0', desc: 'Sub-stage within the active step', bindable: true },
			{ name: 'linear', type: 'boolean', default: 'false', desc: 'Only allow forward progression' },
			{ name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", desc: 'Layout axis' },
			{ name: 'icons', type: 'Partial<IconMap>', desc: 'Override the completed-state icon' }
		],
		events: [
			{ name: 'onclick', signature: '(stepIndex) => void', desc: 'Fires when a step circle is clicked' }
		],
		attrs: [
			{ selector: '[data-stepper]', desc: 'Root container' },
			{ selector: '[data-step]', desc: 'Step wrapper (carries data-completed, data-current)' },
			{ selector: '[data-step-circle]', desc: 'Step number/check circle' },
			{ selector: '[data-step-label]', desc: 'Step text label' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — 3-step wizard',
			lang: 'svelte',
			code: `<script>
  import { Stepper, Button } from '@rokkit/ui'
  let active = $state(0)
  const steps = [
    { text: 'Account',  completed: true },
    { text: 'Profile',  completed: false },
    { text: 'Confirm',  completed: false }
  ]
</script>

<Stepper {steps} bind:current={active} />
<Button onclick={() => active++}>Next</Button>`
		},
		{
			id: 'vertical',
			title: 'Vertical orientation',
			lang: 'svelte',
			code: `<Stepper
  {steps}
  bind:current={active}
  orientation="vertical"
/>`
		},
		{
			id: 'linear',
			title: 'Linear (forward-only)',
			lang: 'svelte',
			code: `<Stepper
  {steps}
  bind:current={active}
  linear
  onclick={(i) => active = i}
/>`
		}
	],
	docs
}

export default meta
