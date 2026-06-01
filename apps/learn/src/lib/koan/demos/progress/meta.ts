import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'progress',
	title: 'ProgressBar',
	description: 'Determinate + indeterminate progress bar — minimal two-prop API.',
	keywords: [
		'progress', 'progressbar', 'loader', 'percentage', 'completion',
		'indeterminate'
	],
	category: 'feedback',
	icon: '進',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_progress',
		description: 'Mount a ProgressBar gallery on the canvas.',
		parameters: { value: 'number or null', max: 'number' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'value', type: 'number | null', desc: 'Current value. `null` / `undefined` triggers indeterminate mode' },
			{ name: 'max', type: 'number', default: '100', desc: 'Maximum value' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [],
		attrs: [
			{ selector: '[data-progress]', desc: 'Root (role="progressbar"; carries data-indeterminate when value is null)' },
			{ selector: '[data-progress-bar]', desc: 'Filled portion — width tracks the computed percentage' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Determinate at common percentages',
			lang: 'svelte',
			code: `<script>
  import { ProgressBar } from '@rokkit/ui'
</script>

<ProgressBar value={25} />
<ProgressBar value={50} />
<ProgressBar value={75} />`
		},
		{
			id: 'custom-max',
			title: 'Custom max',
			lang: 'svelte',
			code: `<ProgressBar value={1024} max={2048} />`
		},
		{
			id: 'indeterminate',
			title: 'Indeterminate',
			lang: 'svelte',
			code: `<ProgressBar value={null} />`
		}
	],
	docs
}

export default meta
