import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'multi-select',
	title: 'Multi-Select',
	description:
		'Pick many values from a dropdown. Selected items render as chips inside the trigger; click a chip to remove.',
	keywords: [
		'multi', 'multi-select', 'multiselect', 'multiple', 'select',
		'pick', 'choose', 'chips', 'chip', 'tags', 'tag', 'options',
		'checkbox', 'checkboxes', 'combo'
	],
	category: 'forms',
	icon: '選',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_multi_select',
		description:
			'Mount a MultiSelect on the canvas. Use when the user needs to pick multiple values from a list — tags, multi-pick filters, role assignment.',
		parameters: {
			items: 'Array<{ label, value }> options',
			value: 'optional array of pre-selected values',
			placeholder: 'optional trigger placeholder text'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'with-counts', label: 'With selection count', mode: 'dynamic' },
		{ id: 'no-overflow', label: 'No chip overflow', mode: 'dynamic' }
	]
}

export default meta
