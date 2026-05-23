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
	load: () => import('./placeholder.svelte')
}

export default meta
