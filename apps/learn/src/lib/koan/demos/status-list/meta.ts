import type { DemoMeta } from '../../types'
import { statusListDocs } from './docs'

const meta: DemoMeta = {
	id: 'status-list',
	title: 'StatusList',
	description: 'Validation criteria with pass / fail / warn / unknown badges — for strength checkers + health views.',
	keywords: [
		'status-list', 'checklist', 'validation', 'password-strength',
		'health-check', 'criteria', 'requirements', 'badges'
	],
	category: 'data',
	icon: '檢',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_status_list',
		description: 'Mount a StatusList on the canvas.',
		parameters: { items: 'array of { text, status }' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'items', type: 'StatusListItem[]', desc: 'Rows: `{ text, status }` where status is `pass | fail | warn | unknown` (or any custom key matched by `icons`)' },
			{ name: 'icons', type: 'Partial<Record<string, string>>', desc: 'Override or extend the status → icon mapping' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [],
		attrs: [
			{ selector: '[data-status-list]', desc: 'Root container (role="status")' },
			{ selector: '[data-status-item]', desc: 'Each row (carries data-status)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — four-state checklist',
			lang: 'svelte',
			code: `<script>
  import { StatusList } from '@rokkit/ui'

  const items = [
    { text: 'At least 8 characters',          status: 'pass' },
    { text: 'Contains an uppercase letter',   status: 'fail' },
    { text: 'Contains a number (recommended)', status: 'warn' },
    { text: 'Special character check',        status: 'unknown' }
  ]
</script>

<StatusList {items} />`
		},
		{
			id: 'live',
			title: 'Live — derived from form input',
			lang: 'svelte',
			code: `<script>
  let password = $state('')
  const checks = $derived([
    { text: 'At least 8 characters', status: password.length >= 8 ? 'pass' : 'fail' },
    { text: 'Has uppercase',          status: /[A-Z]/.test(password) ? 'pass' : 'fail' }
  ])
</script>

<input bind:value={password} type="password" />
<StatusList items={checks} />`
		}
	],
	docs: statusListDocs
}

export default meta
