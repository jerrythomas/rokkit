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
	load: () => import('./placeholder.svelte'),
	tool: {
		name: 'mount_date_picker',
		description:
			'Mount a date / date-time form. Use when the user wants to pick a date, time, or both — events, birthdays, schedules. Demonstrates format-driven dispatch in @rokkit/forms.',
		parameters: {
			data: 'object with ISO-8601 string fields (yyyy-mm-dd or yyyy-mm-ddThh:mm)',
			schema: 'JSON-Schema-ish; use format: "date" or format: "date-time" per field'
		}
	},
	inline: { capable: true },
	variants: [
		{ id: 'with-validation', label: 'With min/max validation', mode: 'dynamic' },
		{ id: 'range', label: 'Date range', mode: 'dynamic' }
	]
}

export default meta
