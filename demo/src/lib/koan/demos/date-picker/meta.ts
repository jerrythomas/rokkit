import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'date-picker',
	title: 'Date Picker',
	description:
		'Date + date-time inputs bound to a single event object. Native calendar/time pickers via InputDate / InputDateTime — schema-aware when used with FormRenderer.',
	keywords: [
		'date', 'datetime', 'date-time', 'time', 'picker', 'calendar',
		'birthday', 'event', 'schedule', 'appointment', 'when',
		'day', 'month', 'year', 'iso8601'
	],
	category: 'forms',
	icon: '日',
	load: () => import('./placeholder.svelte')
}

export default meta
