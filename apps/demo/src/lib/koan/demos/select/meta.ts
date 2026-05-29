import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'select',
	title: 'Select',
	description:
		'Single-pick dropdown. Field-mapped items, keyboard nav, bound value. The flat single-pick counterpart to MultiSelect.',
	keywords: [
		'select', 'dropdown', 'picker', 'choose', 'pick',
		'option', 'options', 'single', 'combo', 'combobox',
		'enum', 'choice', 'choices'
	],
	category: 'forms',
	icon: '択',
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_select',
		description:
			'Mount a single-pick Select dropdown. Use for short to moderately-long lists where the user picks one value. For 20+ items where typing helps, prefer the combobox tool.',
		parameters: {
			items: 'Array<{ label, value }> options',
			value: 'optional pre-selected value',
			maxRows: 'optional max visible rows in dropdown (default 8)',
			placeholder: 'optional trigger placeholder text'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'grouped', label: 'Grouped options', mode: 'dynamic' },
		{ id: 'with-icons', label: 'Options with icons', mode: 'dynamic' }
	]
}

export default meta
