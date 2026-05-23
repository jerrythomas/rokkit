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
	load: () => import('./placeholder.svelte')
}

export default meta
