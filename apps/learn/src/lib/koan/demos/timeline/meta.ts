import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'timeline',
	title: 'Timeline',
	description: 'View-only vertical steps — completed / active flags + an optional content snippet per step.',
	keywords: [
		'timeline', 'steps', 'changelog', 'history', 'process',
		'milestones', 'progress-view'
	],
	category: 'data',
	icon: '時',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_timeline',
		description: 'Mount a Timeline on the canvas.',
		parameters: { items: 'array of step objects with label/subtext/completed/active' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'unknown[]', default: '[]', desc: 'Step data with `label`, optional `subtext`, `icon`, `completed`, `active`' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'icons', type: '{ completed?: string }', desc: 'Override the completed-step icon' },
			{ name: 'content', type: 'Snippet<[item, index]>', desc: 'Custom content rendered inside each step body' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [],
		attrs: [
			{ selector: '[data-timeline]', desc: 'Root container (role="list")' },
			{ selector: '[data-timeline-item]', desc: 'Each step (carries data-completed, data-active)' },
			{ selector: '[data-timeline-circle]', desc: 'The numbered/icon circle' },
			{ selector: '[data-timeline-connector]', desc: 'Vertical guide line between steps' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — completed + active flags',
			lang: 'svelte',
			code: `<script>
  import { Timeline } from '@rokkit/ui'

  const steps = [
    { label: 'Requirements', subtext: 'Gather project requirements.', completed: true },
    { label: 'Design',       subtext: 'Create wireframes.',           completed: true },
    { label: 'Development',  subtext: 'Build the features.',          active: true },
    { label: 'Testing',      subtext: 'Run QA tests.' },
    { label: 'Deployment',   subtext: 'Deploy to production.' }
  ]
</script>

<Timeline items={steps} />`
		},
		{
			id: 'content',
			title: 'With content snippet',
			lang: 'svelte',
			code: `<Timeline items={steps}>
  {#snippet content(item, i)}
    {#if item.action}
      <button onclick={item.action.onclick}>{item.action.label}</button>
    {/if}
  {/snippet}
</Timeline>`
		},
		{
			id: 'icons',
			title: 'Custom step icons',
			lang: 'svelte',
			code: `const events = [
  { label: 'Created',  subtext: '10:42 AM', icon: 'i-mdi:plus-circle' },
  { label: 'Reviewed', subtext: '11:15 AM', icon: 'i-mdi:eye' },
  { label: 'Approved', subtext: '11:30 AM', icon: 'i-mdi:check-circle', completed: true }
]`
		}
	],
	docs
}

export default meta
