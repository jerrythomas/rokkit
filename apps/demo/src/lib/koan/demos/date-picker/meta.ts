import type { DemoMeta } from '../../types'
import { datePickerDocs } from './docs'

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
	],
	api: {
		props: [
			{ name: 'value', type: 'string', default: "''", desc: 'ISO-8601 date or date-time string', bindable: true },
			{ name: 'min', type: 'string', desc: 'Earliest allowed value (ISO-8601)' },
			{ name: 'max', type: 'string', desc: 'Latest allowed value (ISO-8601)' },
			{ name: 'step', type: 'number', desc: 'Time-step granularity in seconds (datetime inputs)' },
			{ name: 'format', type: "'date' | 'date-time' | 'time'", default: "'date'", desc: 'Which native picker to render' },
			{ name: 'required', type: 'boolean', default: 'false', desc: 'Required for FormRenderer validation' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the input' }
		],
		events: [
			{ name: 'onchange', signature: '(value) => void', desc: 'Fires when the input value changes' }
		],
		attrs: [
			{ selector: '[data-field-type="date"]', desc: 'Field wrapper for a date picker' },
			{ selector: '[data-field-type="datetime"]', desc: 'Field wrapper for a date-time picker' },
			{ selector: '[data-field-type="time"]', desc: 'Field wrapper for a time picker' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — single date via FormRenderer',
			lang: 'svelte',
			code: `<script>
  import { FormRenderer } from '@rokkit/forms'
  const schema = {
    type: 'object',
    properties: {
      birthday: { type: 'string', format: 'date' }
    },
    required: ['birthday']
  }
  let data = $state({ birthday: '' })
</script>

<FormRenderer bind:data {schema} />`
		},
		{
			id: 'datetime',
			title: 'Date + time',
			lang: 'svelte',
			code: `const schema = {
  type: 'object',
  properties: {
    startsAt: { type: 'string', format: 'date-time' }
  }
}`
		},
		{
			id: 'min-max',
			title: 'With min / max constraints',
			lang: 'svelte',
			code: `const schema = {
  type: 'object',
  properties: {
    eventDate: {
      type: 'string',
      format: 'date',
      formatMinimum: '2026-01-01',
      formatMaximum: '2026-12-31'
    }
  }
}`
		}
	],
	docs: datePickerDocs
}

export default meta
